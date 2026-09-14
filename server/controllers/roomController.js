const Room = require('../models/Room');
const crypto = require('crypto');

const MAX_PARTICIPANTS = 10;

exports.createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const newRoom = new Room({
      roomName,
      roomCode,
      participants: []
    });
    
    await newRoom.save();
    
    res.status(201).json({
      success: true,
      data: {
        roomCode: newRoom.roomCode,
        createdAt: newRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { code } = req.params;
    const { participantId, displayName } = req.body;
    
    if (!participantId || !displayName) {
      return res.status(400).json({ success: false, message: 'Participant ID and display name required' });
    }
    
    const room = await Room.findOne({ roomCode: code });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Check if participant is already in the room
    const existingParticipant = room.participants.find(p => p.participantId === participantId);
    
    if (existingParticipant) {
      existingParticipant.isOnline = true;
      existingParticipant.lastSeenAt = Date.now();
    } else {
      // Check capacity
      if (room.participants.length >= MAX_PARTICIPANTS) {
        return res.status(403).json({ success: false, message: 'Room is at maximum capacity (10 participants)' });
      }
      
      room.participants.push({
        participantId,
        displayName,
        isOnline: true,
        joinedAt: Date.now(),
        lastSeenAt: Date.now()
      });
    }
    
    await room.save();
    
    res.status(200).json({
      success: true,
      data: {
        roomCode: room.roomCode,
        roomName: room.roomName,
        participants: room.participants,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const { code } = req.params;
    
    const room = await Room.findOne({ roomCode: code });
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.status(200).json({
      success: true,
      data: {
        roomCode: room.roomCode,
        roomName: room.roomName,
        participants: room.participants,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
