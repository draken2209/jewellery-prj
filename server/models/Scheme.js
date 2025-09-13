const mongoose = require('mongoose');
const SchemeSchema = new mongoose.Schema({
  name: String,
  table: [
    {
      range: String,
      installment: Number,
      goldRate: Number,
      weight: Number,
      accumWeight: Number
    }
  ]
});
module.exports = mongoose.model('Scheme', SchemeSchema);
