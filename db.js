const mongoose = require('mongoose');

const mongoUri = "mongodb://localhost:27017/STM25";
// const mongoUri = "mongodb+srv://Mihir6365:X9%2Fz1209636599@deep-blue.jmwssa1.mongodb.net/?retryWrites=true&w=majority";

const connectToMongo = () => {
    mongoose.connect(mongoUri)
}

module.exports = connectToMongo;