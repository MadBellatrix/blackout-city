import mongoose from 'mongoose';

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log('✓ MongoDB verbunden');
    return true;
  } catch (error) {
    console.error('✗ MongoDB-Fehler:', error.message);
    return false;
  }
};

export default connectDB;
