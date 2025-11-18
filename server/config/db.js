const mongoose = require('mongoose');

async function connectDB() {
  // Accept either MONGODB_URI or MONGO_URI (backwards compatibility)
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loan_app';
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(uri, options);
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Log detailed error for debugging
    if (err.name === 'MongoServerSelectionError') {
      console.error('Make sure MongoDB is running on:', uri);
    }
    process.exit(1);
  }
}

module.exports = connectDB;
