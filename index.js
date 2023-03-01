const express = require("express")
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
dotenv.config();
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.uri)


app.post('/api/register', async (req, res) => {
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        })
        res.json({ status: 'ok' })
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




app.listen(5000, () => {
    console.log("server started")
})