// src/lib/db.mjs
import mongoose from 'mongoose';

// Database Connection
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return true;
    }

    await mongoose.connect('mongodb://localhost:27017/health-journal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minLength: [3, 'Username must be at least 3 characters long']
  },
  journals: [{
    date: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      required: [true, 'Journal content is required']
    },
    metrics: {
      sleep: Number,
      exercise: Number,
      symptoms: [String],
      mood: String,
      energy: String
    }
  }]
}, {
  timestamps: true
});

// Initialize User model (prevent multiple model initialization)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Export both the connection function and the User model
export { connectDB, User };