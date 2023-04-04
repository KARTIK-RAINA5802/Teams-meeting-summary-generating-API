const { vttToPlainText } = require("vtt-to-text");
const { spawn } = require('child_process');
const express = require("express")
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const User = require('./models/User')
const Insight = require('./models/Insights')
const connectToMongo = require("./db");
const webvtt = require('node-webvtt');
const session = require('express-session');
const fileUpload = require('express-fileupload')

dotenv.config();
app.use(cors())
app.use(express.json())
app.use(fileUpload())
connectToMongo();

app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
}));

app.post('/api/register', async (req, res) => {
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })
        console.log("user generated");
    } catch (err) {
        res.json({ status: 'error' })
    }
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })
    console.log(user)
    if (user) {
        userEmail = req.body.email;
        req.session.email = userEmail;
        console.log(req.session.email);
        return res.send("Logged in Successfully")
    } else {
        return res.json({ status: 'error', user: false })
    }
})

app.post('/api/logout', async (req, res) => {
    req.session.destroy();
    res.send('Logged out successfully');
})

app.post('/api/generate', async (req, res) => {
    // const userEmail = req.session.email;
    var summary
    const input = req.files
    const srt = input.file.data.toString()
    var transcript = [];
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
    childPython.on('close', async () => {
        let meeting = [{ transcript: transcript, insights: insights, summary: summary }];
        return res.send(meeting)

    });
})

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