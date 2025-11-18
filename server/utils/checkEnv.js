const checkEnvVariables = () => {
  const missing = [];

  // PORT and JWT_SECRET are required
  if (!process.env.PORT) missing.push('PORT');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  // Accept either MONGODB_URI or MONGO_URI
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) missing.push('MONGODB_URI or MONGO_URI');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Warn about optional variables
  const optional = ['NODE_ENV'];
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn('⚠️ Optional environment variables not set:');
    missingOptional.forEach(key => console.warn(`   - ${key}`));
  }
};

module.exports = checkEnvVariables;