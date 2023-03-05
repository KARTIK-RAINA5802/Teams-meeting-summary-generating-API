const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('strictQuery', true);

const InsightSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    meetings: [
      {
        meetingID: {
            type: Schema.Types.ObjectId,
        },
        summary: {
            type: String,
            required: true
        },
        transcript: {
            type: String,
            required: true
        },
        impwords: {
            type: [String],
            required: true
        }
      }
    ]
});

module.exports = mongoose.model('Insight', InsightSchema);
