import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure participants array has exactly 2 users
directMessageSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Direct message must have exactly 2 participants'));
  }
  next();
});

// Create unique index for participants to prevent duplicate conversations
directMessageSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model('DirectMessage', directMessageSchema);
