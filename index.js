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
        if (!user) return res.status(400).json({ msg: "User does not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Password" });

        const token = jwt.sign({ id: user._id, mail: email }, process.env.JWT_SECRET);
        const insights = await Insight.findOne({ email: req.body.email });
        delete user.password;
        console.log(token);
        res.status(200).json({ token, user, insights });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

app.post('/api/generate', async (req, res) => {
    try {
        let emailFromToken;
        // Pass the token here to this function 
        // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MzgzZGQyMTNmZjFjOGYxNzY5Yjk0ZSIsIm1haWwiOiJhYmNAeHl6LmdtYWlsLmNvbSIsImlhdCI6MTY4MTQ3NTcwMH0.dssFc2A8LBr8AT4VqO5Ua6xZYex26EmMJVpKZFG7A4w';
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Handle invalid token
                console.error(err);
            } else {
                // Email is stored in the decoded object
                emailFromToken = decoded.mail;
                console.log(emailFromToken);
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

        const meeting = [{ transcript: transcript, insights: insights, summary: summary, keyword: keywordArray /*modelBasedText: modelizedText*/ }];

        Insight.findOne({ "email": emailFromToken })
            .then(result => {
                if (!result) {
                    const insight = new Insight({ email: emailFromToken, meetings: meeting });
                    insight.save()
                        .then(() => console.log("Meeting details added with user email"))
                        .catch(err => console.error(err))
                    return res.send(meeting);
                } else {
                    Insight.updateOne({ email: emailFromToken }, { $push: { meetings: { summary: meeting[0].summary, transcript: meeting[0].transcript, insights: meeting[0].insights, keyword: meeting[0].keywordArray } } })
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



// app.post('/api/generate', async (req, res) => {
//     // const userEmail = req.session.email;
//     var summary
//     const input = req.files
//     const srt = input.file.data.toString()
//     var transcript = [];
//     let inputtxt = vttToPlainText(srt);
//     const childPython = spawn('python', ['summary.py', `${inputtxt}`]);
//     childPython.stdout.on('data', (data) => {
//         summary = data.toString();
//     });

//     const keywords = spawn('python', ['kw.py', `${inputtxt}`]);
//     let keywordArray = [];
//     keywords.stdout.on('data', (data) => {
//         kW = data.toString();
//         keywordArray = kW.split(",");
//     });

//     const textOnModel = spawn('python', ['modelWiseText.py', `${inputtxt}`]);
//     textOnModel.stdout.on('data', (data) => {
//         modelizedText = data.toString();
//     })

//     var members = {};
//     var meet_end;
//     var active_mem = 0;
//     const parsed = webvtt.parse(srt, { strict: true });
//     var cues = parsed.cues;
//     for (var cue of cues) {
//         var cue_object = {};
//         cue_object["start"] = cue["start"];
//         var str = cue.text;
//         var name = str.substring(
//             3,
//             str.indexOf(">")
//         );
//         cue_object["name"] = name;
//         var sentence = str.substring(
//             str.indexOf(">") + 1,
//             str.lastIndexOf("<")
//         );
//         cue_object["sentence"] = sentence;
//         var weight = sentence.split(" ").length;
//         if (members[name] === undefined) {
//             members[name] = 0; 4
//         }
//         members[name] += weight;
//         meet_end = cue["end"];
//         transcript.push(cue_object)
//     }

//     for (const key in members) {
//         if (members.hasOwnProperty(key)) {
//             if (members[key] > 25) {
//                 active_mem++;
//             }
//         }
//     }
//     var insights = { duration: meet_end, speakers: members, active_members: active_mem }
//     childPython.on('close',  () => {
//         let meeting = [{ transcript: transcript, insights: insights, summary: summary, keyword:keywordArray}];
//         console.log(meeting);
//         return res.send(meeting)
//     });
// })

app.post('/api/generateaudio', async (req, res) => {
    const transcript = req.body.transcript;
    const childPython = spawn('python', ['summary.py', `${transcript}`]);
    childPython.stdout.on('data', (data) => {
        summary = data.toString();
        res.send(summary)
    });
})



app.listen(5000, () => {
    console.log("server started")
})