import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const client = new MongoClient(process.env.uri);

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

app.post('/profile', async (req, res) => {

    var query = { _id: req.body.id };

    client.db("Teams_summarizer")
        .collection("User_profiles")
        .find(query).toArray(function (err, result) {
            if (err) throw err;
            return res.json(result)
        });
});

app.listen(process.env.PORT || 3000, () => { console.log("running...") })