const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if(!token) return res.status(401).json({msg:'No token'});
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(e) {
    res.status(401).json({msg:'Invalid token'});
  }
}

function adminOnly(req,res,next){
  if(req.user?.role !== 'admin') return res.status(403).json({msg:'Admins only'});
  next();
}

module.exports = { auth, adminOnly };
