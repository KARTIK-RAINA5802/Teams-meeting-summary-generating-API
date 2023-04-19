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
                type: Schema.Types.Mixed,
                validate: function () {
                  if (this.type === 'vtt') {
                    return {
                      type: [
                        {
                          start: {
                            type: Number,
                            required: true,
                          },
                          name: {
                            type: String,
                            required: true,
                          },
                          sentence: {
                            type: String,
                            required: true,
                          },
                        },
                      ],
                    };
                  } else if (this.type === 'audio') {
                    return {
                      type: String,
                      required: true,
                    };
                  }
                },
            },
            insights: {
                duration: {
                    type: String,
                },
                speakers: {
                    type: Map,
                    of: Number
                },
                active_members: {
                    type: Number,
                }

            },
            keyword: {
                type: [String],
                required: true
            },
            name: {
                type: String,
                require: true
            },
            type: {
                type: String,
                required: true
            },
            actionwords: [
                String
            ]
        }
    ]
});

module.exports = mongoose.model('Insight', InsightSchema);
