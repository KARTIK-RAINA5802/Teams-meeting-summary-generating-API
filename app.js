import express from 'express';
// import fun from './test.js';
const app = express()

// var objdata = await fun();
// const data = async () => {
//     var x = await fun()
//     objdata = x;
// }

// const objdata = { "name": "abc" }
// var objdata = JSON.parse(data);
app.get('/', (req, res) => {
    res.send('Hello world')
})
app.get('/summmarize', (req, res) => {

    res.send({ "version": "1.0.0", "Name": "Teams meeting summarizer" })
})
app.get('/post', (req, res) => {
    req.body
    res.send({ "version": "1.0.0", "Name": "Teams meeting summarizer" })
})

app.listen(process.env.PORT || 3000, () => { console.log("running...") })