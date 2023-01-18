import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';
// import fun from './test.js';
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const client = new MongoClient(process.env.uri);

// var objdata = await fun();
// const data = async () => {
//     var x = await fun()
//     objdata = x;
// }

// const objdata = { "name": "abc" }
// var objdata = JSON.parse(data);

//aaaa

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.post('/addprofile', async (req, res) => {
    let user = req.body;
    await client.db("Teams_summarizer")
        .collection("User_profiles")
        .insertOne(user)
    return res.json({ status: true })
});


app.listen(process.env.PORT || 3000, () => { console.log("running...") })