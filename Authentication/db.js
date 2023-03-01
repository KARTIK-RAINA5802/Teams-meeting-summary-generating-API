const mongoose = require('mongoose');

const mongoUri = ""; //Add your own mongodb uri

const connectToMongo = () => {
    mongoose.connect(mongoUri, () => {
        console.log("Connected to mongoDB........");
    })
}

module.exports = connectToMongo;