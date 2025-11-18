const router = require('express').Router();
const mongoose = require('mongoose');
const { auth, adminOnly } = require('../middleware/auth');
const Payment = require('../models/Payment');

// Create a new payment (user-initiated)
router.post('/', auth, async (req, res) => {
  try {
    const { loanId, amount, paymentMethod, transactionId, remarks } = req.body;
    if (!loanId || !amount || !paymentMethod) {
      return res.status(400).json({ msg: 'loanId, amount and paymentMethod are required' });
    }

    const payment = await Payment.create({
      loanId: new mongoose.Types.ObjectId(loanId),
      userId: new mongoose.Types.ObjectId(req.user.id),
      amount: Number(amount),
      paymentMethod,
      transactionId,
      remarks,
      status: 'pending',
    });

    res.json(payment);
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get payments for a user
router.get('/user/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    // Allow only owner or admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const payments = await Payment.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    console.error('Fetch user payments error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update payment status (admin only)
router.put('/:id/status', [auth, adminOnly], async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const allowed = ['pending', 'completed', 'failed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }

    payment.status = status;
    if (remarks) payment.remarks = remarks;
    await payment.save();

    res.json(payment);
  } catch (err) {
    console.error('Update payment status error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;