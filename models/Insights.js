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
            transcript: [
               {
                  start: {
                    type: Number,
                    required: true
                  },
                  name: {
                    type: String,
                    required: true
                  },
                  sentence: {
                    type: String,
                    required: true
                  }
               }
            ],
            insights: {
                duration: {
                    type: String,
                    required: true
                },
                speakers: {
                    type: Map,
                    of: Number
                },
                active_members: {
                    type: Number,
                    required: true
                }

            }
        }
    ]
});

module.exports = mongoose.model('Insight', InsightSchema);
