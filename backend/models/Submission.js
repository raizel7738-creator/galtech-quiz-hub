const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingChallenge', required: true },
  language_id: { type: Number, required: true },
  source_code: { type: String, required: true },
  result: {
    status: Object,
    stdout: String,
    stderr: String,
    compile_output: String,
    time: String,
    memory: Number
  },
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  passed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
