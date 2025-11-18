const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Create default admin if not exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new User({
        name: 'Admin',
        email: 'admin@example.com'.toLowerCase(),
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Default admin created');
    }
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
};

// Call this function when the server starts
createDefaultAdmin();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Enhanced input validation
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ 
        success: false,
        msg: 'Please enter all required fields',
        fields: {
          name: !name?.trim() ? 'Name is required' : null,
          email: !email?.trim() ? 'Email is required' : null,
          password: !password?.trim() ? 'Password is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        msg: 'Please enter a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ success: false, msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'  // default to 'user' if role is not provided
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('👉 Login attempt for email:', req.body.email);
    const { email, password } = req.body;

    // Enhanced input validation
    if (!email?.trim() || !password?.trim()) {
      console.log('❌ Login validation failed: Missing fields');
      return res.status(400).json({
        success: false,
        msg: 'Please enter all required fields',
        fields: {
          email: !email?.trim() ? 'Email is required' : null,
          password: !password?.trim() ? 'Password is required' : null
        }
      });
    }

    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        msg: 'Database connection error. Please try again.'
      });
    }

    // Check if user exists (using index)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')  // Explicitly include password field
      .catch(err => {
        console.error('❌ Database query error:', err);
        return null;
      });

    if (!user) {
      console.log('❌ Login failed: User not found for email:', email);
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid email or password' 
      });
    }

    // Validate password exists in user document
    if (!user.password) {
      console.error('❌ User found but password field is missing for email:', email);
      return res.status(500).json({
        success: false,
        msg: 'Account configuration error. Please contact support.'
      });
    }

    // Validate password with consistent timing
    const isMatch = await bcrypt.compare(password, user.password)
      .catch(err => {
        console.error('❌ Password comparison error:', err);
        return false;
      });

    if (!isMatch) {
      console.log('❌ Login failed: Invalid password for email:', email);
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid email or password'
      });
    }

    console.log('✅ Login successful for email:', email);

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get current user
router.get('/user', require('../middleware/auth').auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('❌ Get user error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error fetching user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
