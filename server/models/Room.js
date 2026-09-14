const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  participantId: { type: String, required: true },
  displayName: { type: String, required: true },
  isOnline: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
    unique: true
  },
  roomCode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  participants: [participantSchema],
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // TTL index: documents expire after 24 hours (86400 seconds)
  }
});

module.exports = mongoose.model('Room', roomSchema);
