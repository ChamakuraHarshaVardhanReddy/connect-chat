import express from 'express';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms user is member of
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { members: req.user._id },
        { type: 'public' }
      ]
    })
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar online')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a room name' });
    }

    // Check if room name already exists
    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const room = await Room.create({
      name,
      description: description || '',
      type: type || 'public',
      createdBy: req.user._id
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar online');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get a single room
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar online')
      .populate('lastMessage');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is member or room is public
    const isMember = room.members.some(member => member._id.toString() === req.user._id.toString());
    if (!isMember && room.type === 'private') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/rooms/:id/join
// @desc    Join a room
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is already a member
    const isMember = room.members.some(member => member.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this room' });
    }

    room.members.push(req.user._id);
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar online');

    res.json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
