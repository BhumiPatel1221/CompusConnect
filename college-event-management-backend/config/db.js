const mongoose = require('mongoose');

/**
 * Connect to MongoDB Local Database
 * This function establishes connection to local MongoDB instance
 * Make sure MongoDB service is running on your machine
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB using connection string from .env file
    // Note: useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 6+
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
