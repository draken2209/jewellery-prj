const mongoose = require('mongoose');
const MemberSchema = new mongoose.Schema({
  idNumber: String,
  customerName: String,
  fatherName: String,
  aadhar: String,
  dateOfAgreement: String,
  schemeName: String
});
module.exports = mongoose.model('Member', MemberSchema);
