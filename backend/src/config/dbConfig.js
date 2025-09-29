import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.log("⚠️  MongoDB URI not provided - running in mock mode");
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB 🔗: ${conn.connection.host}`);
  } catch (error) {
    console.log("⚠️  MongoDB connection failed - running in mock mode");
    console.log("Error:", error.message);
  }
};

export default connectDB;
