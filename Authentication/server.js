const express = require('express');
const connectToMongo = require('./db');

connectToMongo();

const app = express();
const port = 3000;

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

app.listen(port, () => {
    console.log(`The app is listening at port:${port}`)
}) 