const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
}, { collection: 'user-data' });

const model = mongoose.model('UserData', User)

module.exports = model