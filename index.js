var fs = require('fs');
const {vttToPlainText} = require("vtt-to-text");
const { spawn, ChildProcess } = require('child_process');
const express = require("express")
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
const Insight = require('./models/Insights')
const jwt = require('jsonwebtoken')
const connectToMongo = require("./db");
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


app.get('/api/summary', async (req, res) => {
    var srt = fs.readFileSync('sub.vtt','utf8');
    let data = vttToPlainText(srt);
    console.log(data);
    // let text = "brotha";
    let text = data;
    
    const childPython = spawn('python', ['summary.py', `${text}`]);
    
    childPython.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    
    childPython.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    
    childPython.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
})


app.post('/api/getInsights', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    console.log(req.body.email);
    if (user) {
        Insight.findOne({"email": req.body.email})
            .then(result => {
                if(!result) {
                    const insight = new Insight({email: req.body.email, meetings: req.body.meetings});
                    insight.save()
                    .then(() => console.log("Meeting details added with user email"))
                    .catch(err => console.error(err))
                    return res.json({ status: 'ok', user: true })
                }else {
                    const newNote = req.body.meetings[0];
                    console.log(newNote.impwords);
                    Insight.updateOne({email:req.body.email}, {$push: {meetings: {summary: newNote.summary, transcript: newNote.transcript, impwords: newNote.impwords}}})
                      .then(user => {
                        console.log(user);
                        console.log("Added new meeting details to existing user")
                      })
                      .catch(err => {
                        console.error(err);
                      });
                    return res.json({ status: 'ok', user: true })
                }
            })
            .catch(err => console.error(err));
    } else {
        return res.json({ status: 'error', user: false })
    }
})

// var parser = require('subtitles-parser-vtt');


// var data = parser.fromVtt(srt);
// console.log(data);

app.listen(5000, () => {
    console.log("server started")
})