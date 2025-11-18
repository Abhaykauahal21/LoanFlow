const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  try {
    // Check for token in Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        msg: 'Access denied. No token provided.'
      });
    }

    // Verify token format
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: 'Access denied. Invalid token format.'
      });
    }

    try {
      // Verify token and extract user data
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          msg: 'User no longer exists.'
        });
      }

      // Attach user info to request
      req.user = {
        id: user._id,
        role: user.role,
        email: user.email
      };
      
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          msg: 'Token has expired. Please login again.'
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          msg: 'Invalid token. Please login again.'
        });
      }
      
      throw err;
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({
      success: false,
      msg: 'Internal server error during authentication.'
    });
  }
}

function adminOnly(req,res,next){
  if(req.user?.role !== 'admin') return res.status(403).json({msg:'Admins only'});
  next();
}

module.exports = { auth, adminOnly };
