var fs = require('fs');
const { vttToPlainText } = require("vtt-to-text");
const { spawn } = require('child_process');
const express = require("express")
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
const Insight = require('./models/Insights')
const jwt = require('jsonwebtoken')
const connectToMongo = require("./db");
const webvtt = require('node-webvtt');

dotenv.config();
app.use(cors())
app.use(express.json())

// mongoose.connect(process.env.uri)
connectToMongo();


app.post('/api/register', async (req, res) => {
    try {
        // console.log(req.body.email);
        // const user = await User.findOne({email: req.body.email});
        // if(user) {
        //     return res.status(400).json({error: "Sorry a user with this email already exists."})
        // }
        // const salt = await bcrypt.genSalt(10);
        // const secPass = await bcrypt.hash(req.body.password, salt);
        // console.log(req.user);
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })
        // res.json({ status: 'ok' })
        console.log("user generated");
    } catch (err) {
        res.json({ status: 'error' })
    }

})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    console.log(req.body.email);
    if (user) {
        console.log(true)
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            'secret123'
        )
        return res.json({ status: 'ok', user: token })
    } else {
        return res.json({ status: 'error', user: false })
    }
})


app.get('/api/meetings', async (req, res) => {

})



///////...................................................In order to request on this route(/api/generate) you have to send email in the body ........................................................../////////
app.get('/api/generate', async (req, res) => {
    var summary;
    var transcript = [];
    var srt = fs.readFileSync('sub.vtt', 'utf8');
    let inputtxt = vttToPlainText(srt);
    const childPython = spawn('python', ['summary.py', `${inputtxt}`]);
    childPython.stdout.on('data', (data) => {
        summary = data.toString();
    });


    var members = {};
    var meet_end;
    var active_mem = 0;
    const parsed = webvtt.parse(srt, { strict: true });
    var cues = parsed.cues;
    for (var cue of cues) {
        var cue_object = {};
        cue_object["start"] = cue["start"];
        var str = cue.text;
        var name = str.substring(
            3,
            str.indexOf(">")
        );
        cue_object["name"] = name;
        var sentence = str.substring(
            str.indexOf(">") + 1,
            str.lastIndexOf("<")
        );
        cue_object["sentence"] = sentence;
        var weight = sentence.split(" ").length;
        if (members[name] === undefined) {
            members[name] = 0; 4
        }
        members[name] += weight;
        meet_end = cue["end"];
        transcript.push(cue_object)
    }

    for (const key in members) {
        if (members.hasOwnProperty(key)) {
            if (members[key] > 25) {
                active_mem++;
            }
        }
    }

    var insights = { duration: meet_end, speakers: members, active_members: active_mem }
    childPython.on('close', (code) => {
        let meeting = [{ transcript: transcript, insights: insights, summary: summary }];
        Insight.findOne({ "email": req.body.email })
            .then(result => {
                if (!result) {
                    const insight = new Insight({ email: req.body.email, meetings: meeting });
                    insight.save()
                        .then(() => console.log("Meeting details added with user email"))
                        .catch(err => console.error(err))
                    return res.json({ status: 'ok', user: true })
                } else {
                    Insight.updateOne({ email: req.body.email }, { $push: { meetings: { summary: meeting[0].summary, transcript: meeting[0].transcript, insights: meeting[0].insights } } })
                        .then(user => {
                            console.log(user);
                            console.log("Added new meeting details to existing user")
                        })
                        .catch(err => {
                            console.error(err);
                        });
                    return res.send(meeting)
                }
            })
        });
        


})




app.listen(5000, () => {
    console.log("server started")
})