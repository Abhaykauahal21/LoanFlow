const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const Loan = require('../models/Loan');

// Get user's loans
router.get('/my-loans', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({ message: 'Error fetching loans' });
  }
});

// Get user's dashboard statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [statusStats, amountStats, monthlyStats] = await Promise.all([
      // Get loan count by status
      Loan.aggregate([
        { $match: { user: userId } },
        { 
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),

      // Get amount statistics
      Loan.aggregate([
        { 
          $match: { 
            user: userId,
            status: 'Approved'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
            minAmount: { $min: '$amount' },
            maxAmount: { $max: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Get monthly statistics for the last 6 months
      Loan.aggregate([
        {
          $match: {
            user: userId,
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            approved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0]
              }
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0]
              }
            },
            rejected: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Process status stats
    const loansByStatus = statusStats.reduce((acc, stat) => {
      acc[stat._id.toLowerCase()] = stat.count;
      acc.total = (acc.total || 0) + stat.count;
      return acc;
    }, {});

    // Process amount stats
    const amountData = amountStats[0] || { totalAmount: 0, avgAmount: 0 };

    res.json({
      loans: {
        total: loansByStatus.total || 0,
        approved: loansByStatus.approved || 0,
        pending: loansByStatus.pending || 0,
        rejected: loansByStatus.rejected || 0
      },
      amounts: {
        total: amountData.totalAmount || 0,
        average: amountData.avgAmount || 0
      },
      monthlyStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only support jpeg, jpg, png, pdf'));
  }
});

// Apply for loan (with document upload)
router.post('/apply', auth, upload.array('documents', 3), async (req, res) => {
  try {
    const { amount, tenureMonths, income } = req.body;
    
    const loan = new Loan({
      user: req.user.id,
      amount: Number(amount),
      tenureMonths: Number(tenureMonths),
      income: Number(income),
      documents: req.files.map(file => `uploads/${file.filename}`),
      status: 'Pending'
    });

    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's loans
router.get('/my', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get specific loan details
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    // Check if user owns this loan or is admin
    if (loan.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(loan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
