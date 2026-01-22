import express from 'express';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import DirectMessage from '../models/DirectMessage.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/room/:roomId
// @desc    Get messages for a room
// @access  Private
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if user is member of room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember && room.type === 'private') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/messages/dm/:dmId
// @desc    Get messages for a direct message conversation
// @access  Private
router.get('/dm/:dmId', protect, async (req, res) => {
  try {
    const { dmId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if user is participant
    const dm = await DirectMessage.findById(dmId);
    if (!dm) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = dm.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ directMessage: dmId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
