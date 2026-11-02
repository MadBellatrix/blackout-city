import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB verbunden: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Fehler bei der MongoDB-Verbindung: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
