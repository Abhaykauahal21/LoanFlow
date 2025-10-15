const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const Loan = require('../models/Loan');
const User = require('../models/User');

// Get all loans (admin only)
router.get('/loans', [auth, adminOnly], async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Search by user email or name if provided
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
      const userIds = users.map(user => user._id);
      query.user = { $in: userIds };
    }

    const loans = await Loan.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update loan status (admin only)
router.put('/loans/:id/status', [auth, adminOnly], async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    loan.status = status;
    if (adminNote) {
      loan.adminNote = adminNote;
    }

    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user profiles (admin only)
router.get('/users', [auth, adminOnly], async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user loan statistics (admin only)
router.get('/stats', [auth, adminOnly], async (req, res) => {
  try {
    const stats = await Loan.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
