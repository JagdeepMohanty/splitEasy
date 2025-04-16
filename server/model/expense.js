
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Expense', expenseSchema);