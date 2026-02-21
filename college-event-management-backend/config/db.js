const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas Database
 * This function establishes connection to MongoDB Atlas cloud instance
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(` Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
