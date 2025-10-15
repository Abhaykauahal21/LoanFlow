const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  tenureMonths: Number,
  income: Number,
  documents: [String], // file paths or URLs
  status: { type: String, enum: ['Pending','Under Review','Approved','Rejected'], default: 'Pending' },
  adminNote: String
}, { timestamps: true });

module.exports = mongoose.model('Loan', LoanSchema);
