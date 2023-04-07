const { vttToPlainText } = require("vtt-to-text");
const { spawn } = require('child_process');
const express = require("express")
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const webvtt = require('node-webvtt');
const fileUpload = require('express-fileupload')

dotenv.config();
app.use(cors())
app.use(express.json())
app.use(fileUpload())


app.post('/api/generate', async (req, res) => {
    try {
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

        let modelizedText;
        const childPython3 = spawn('python', ['modelWiseText.py', `${inputtxt}`]);
        modelizedText = (await getSubprocessOutput(childPython3)).toString();

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

        const meeting = [{ transcript: transcript, insights: insights, summary: summary, keyword: keywordArray, modelBasedText: modelizedText }];
        console.log(meeting);
        res.send(meeting);
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