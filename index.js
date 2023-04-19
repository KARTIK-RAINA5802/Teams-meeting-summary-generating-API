const { vttToPlainText } = require("vtt-to-text");
const { spawn } = require('child_process');
const express = require("express")
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const webvtt = require('node-webvtt');
const fileUpload = require('express-fileupload')
const connectToMongo = require('./db')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('./models/User');
const Insight = require('./models/Insights');

dotenv.config();
app.use(cors())
app.use(express.json())
app.use(fileUpload())

connectToMongo();

app.post('/SignUp', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        try {
            console.log(req.body);

            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;

            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            const newUser = new User({
                username,
                email,
                password: passwordHash
            })
            const savedUser = await newUser.save();
            res.status(201).json(savedUser);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json({ error: "User with this email already exists" });
    }

})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).json({ error: "User does not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid Password" });

        const token = jwt.sign({ id: user._id, mail: email }, process.env.JWT_SECRET);
        const insights = await Insight.findOne({ email: req.body.email });
        delete user.password;
        res.status(200).json({ token, user, insights });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/getdata', async (req, res) => {
    let emailFromToken;
    try {

        jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.send(err);
            } else {
                emailFromToken = decoded.mail;

            }
        });
        const insights = await Insight.findOne({ email: emailFromToken });
        res.status(200).json(insights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.post('/api/generate', async (req, res) => {
    try {
        const token = req.body.token
        let emailFromToken;
        // Pass the token here to this function 
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Handle invalid token
                console.error(err);
            } else {
                // Email is stored in the decoded object
                emailFromToken = decoded.mail;
            }
        });

        const input = req.files;
        const srt = input.file.data.toString();
        const inputtxt = vttToPlainText(srt);

        let summary;
        const childPython1 = spawn('python', ['summary.py', `${inputtxt}`]);
        summary = (await getSubprocessOutput(childPython1)).toString();

        let keywordArray;
        const childPython2 = spawn('python', ['kw.py', `${inputtxt}`]);
        const kW = (await getSubprocessOutput(childPython2)).toString();
        keywordArray = kW.split(',');

        // let modelizedText;
        // const childPython3 = spawn('python', ['modelWiseText.py', `${inputtxt}`]);
        // modelizedText = (await getSubprocessOutput(childPython3)).toString();

        const parsed = webvtt.parse(srt, { strict: true });
        const cues = parsed.cues;
        const members = {};
        let meet_end;
        let active_mem = 0;
        const transcript = cues.map(cue => {
            const cue_object = {};
            cue_object['start'] = cue['start'];
            const str = cue.text;
            const name = str.substring(3, str.indexOf('>'));
            cue_object['name'] = name;
            const sentence = str.substring(str.indexOf('>') + 1, str.lastIndexOf('<'));
            cue_object['sentence'] = sentence;
            const weight = sentence.split(' ').length;
            if (members[name] === undefined) {
                members[name] = 0;
            }
            members[name] += weight;
            meet_end = cue['end'];
            return cue_object;
        });

        for (const key in members) {
            if (members.hasOwnProperty(key)) {
                if (members[key] > 25) {
                    active_mem++;
                }
            }
        }
        const insights = { duration: meet_end, speakers: members, active_members: active_mem };

        const meeting = [{ transcript: transcript, insights: insights, summary: summary, keyword: keywordArray, name: "Name of the Meeting", type: "vtt", actionwords: ["abc ds", "adf", "asdaf"] }];

        Insight.findOne({ "email": emailFromToken })
            .then(result => {
                if (!result) {
                    const insight = new Insight({ email: emailFromToken, meetings: meeting });
                    insight.save()
                        .then(() => console.log("Meeting details added with user email"))
                        .catch(err => console.error(err))
                    return res.send(meeting);
                } else {
                    Insight.updateOne({ email: emailFromToken }, { $push: { meetings: { summary: meeting[0].summary, transcript: meeting[0].transcript, insights: meeting[0].insights, keyword: meeting[0].keyword, name: meeting[0].name, type: meeting[0].type, actionwords: meeting[0].actionwords } } })
                        .then(user => {
                            console.log(user);
                            console.log("Added new meeting details to existing user")
                        })
                        .catch(err => {
                            console.error(err);
                        });
                    return res.send(meeting);
                }
            })
            .catch(err => console.error(err));

        console.log(meeting);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});



app.post('/api/generateaudio', async (req, res) => {
    try {
        const token = req.body.token
        let emailFromToken;
        // Pass the token here to this function 
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Handle invalid token
                console.error(err);
            } else {
                // Email is stored in the decoded object
                emailFromToken = decoded.mail;
            }
        });

        const transcript = req.body.transcript;

        const inputtxt = transcript;

        let summary;
        const childPython1 = spawn('python', ['summary.py', `${transcript}`]);
        summary = (await getSubprocessOutput(childPython1)).toString();

        let keywordArray;
        const childPython2 = spawn('python', ['kw.py', `${inputtxt}`]);
        const kW = (await getSubprocessOutput(childPython2)).toString();
        keywordArray = kW.split(',');

        const meeting = [{ transcript: transcript, summary: summary, keyword: keywordArray, name: "Name of the Meeting", type: "audio", actionwords: ["abc ds", "adf", "asdaf"] }];

        Insight.findOne({ "email": emailFromToken })
            .then(result => {
                if (!result) {
                    const insight = new Insight({ email: emailFromToken, meetings: meeting });
                    insight.save()
                        .then(() => console.log("Meeting details added with user email"))
                        .catch(err => console.error(err))
                    return res.send(meeting);
                } else {
                    Insight.updateOne({ email: emailFromToken }, { $push: { meetings: { summary: meeting[0].summary, transcript: meeting[0].transcript, keyword: meeting[0].keyword, name: meeting[0].name, type: meeting[0].type, actionwords: meeting[0].actionwords } } })
                        .then(user => {
                            console.log(user);
                            console.log("Added new meeting details to existing user")
                        })
                        .catch(err => {
                            console.error(err);
                        });
                    return res.send(meeting);
                }
            })
            .catch(err => console.error(err));

        console.log(meeting);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
})

function getSubprocessOutput(child) {
    return new Promise((resolve, reject) => {
        let output = '';
        child.stdout.on('data', data => {
            output += data;
        });
        child.on('close', () => {
            resolve(output);
        });
        child.on('error', error => {
            reject(error);
        });
    });
}


app.listen(5000, () => {
    console.log("server started")
})