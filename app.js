import 'dotenv/config';
import express from 'express';
import { MongoClient, ObjectId } from "mongodb";
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const client = new MongoClient(process.env.uri);
app.get('/', (req, res) => {
    res.send('Hello world')
})

app.post('/signup', async (req, res) => {
    let user = req.body;
    await client.db("Teams_summarizer")
        .collection("User_profiles")
        .insertOne(user)
    return res.json({ status: true })
});

app.post('/login', async (req, res) => {
    let user = req.body;
    client.db("Teams_summarizer")
        .collection("User_profiles")
        .findOne({ email: user.email, password: user.password }, function (err, result) {
            if (err) return { status: false };
            return res.json({ status: true, id: result._id })
        });
});

app.post('/profile', async (req, res) => {
    client.db("Teams_summarizer")
        .collection("User_profiles")
        .findOne({ _id: ObjectId(req.body.id) }, function (err, result) {
            if (err) return { status: false };
            return res.json({ status: true, result: result })
        });
});

app.listen(process.env.PORT || 3000, () => { console.log("running...") })