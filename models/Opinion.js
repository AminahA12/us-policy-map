const mongoose = require('mongoose');

const opinionSchema = new mongoose.Schema({
  state:     { type: String, required: true },
  name:      { type: String, trim: true, default: 'Anonymous' },
  topic:     { type: String, trim: true },
  opinion:   { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Opinion', opinionSchema);
