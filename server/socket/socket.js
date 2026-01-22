import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import DirectMessage from '../models/DirectMessage.js';

// Store active users
const activeUsers = new Map();

export const setupSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.userId})`);

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { online: true });
    activeUsers.set(socket.userId, socket.id);

    // Emit user online status to all clients
    io.emit('user-online', { userId: socket.userId });

    // Join user's rooms
    const rooms = await Room.find({
      $or: [
        { members: socket.userId },
        { type: 'public' }
      ]
    });

    rooms.forEach(room => {
      socket.join(`room:${room._id}`);
    });

    // Join user's direct message conversations
    const directMessages = await DirectMessage.find({
      participants: socket.userId
    });

    directMessages.forEach(dm => {
      socket.join(`dm:${dm._id}`);
    });

    // Handle joining a room
    socket.on('join-room', async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        if (room) {
          socket.join(`room:${roomId}`);
          socket.to(`room:${roomId}`).emit('user-joined-room', {
            userId: socket.userId,
            userName: socket.user.name,
            roomId
          });
        }
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    // Handle leaving a room
    socket.on('leave-room', (roomId) => {
      socket.leave(`room:${roomId}`);
      socket.to(`room:${roomId}`).emit('user-left-room', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId
      });
    });

    // Handle sending a message to a room
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content, media } = data;

        if (!roomId || (!content && !media)) {
          return socket.emit('error', { message: 'Invalid message data' });
        }

        // Verify user is member of room
        const room = await Room.findById(roomId);
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        const isMember = room.members.some(member => member.toString() === socket.userId);
        if (!isMember && room.type === 'private') {
          return socket.emit('error', { message: 'Access denied' });
        }

        // Create message
        const message = await Message.create({
          content: content || '',
          sender: socket.userId,
          room: roomId,
          media: media || null
        });

        // Populate sender info
        await message.populate('sender', 'name email avatar');

        // Update room's last message
        room.lastMessage = message._id;
        room.lastMessageAt = new Date();
        await room.save();

        // Emit to all users in the room
        io.to(`room:${roomId}`).emit('new-message', message);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle sending a direct message
    socket.on('send-direct-message', async (data) => {
      try {
        const { recipientId, dmId, content, media } = data;

        if ((!recipientId && !dmId) || (!content && !media)) {
          return socket.emit('error', { message: 'Invalid message data' });
        }

        // Find or create direct message conversation
        let dm;
        if (dmId) {
          dm = await DirectMessage.findById(dmId);
          if (!dm) {
            return socket.emit('error', { message: 'Conversation not found' });
          }
          // Verify user is participant
          const isParticipant = dm.participants.some(p => p.toString() === socket.userId);
          if (!isParticipant) {
            return socket.emit('error', { message: 'Access denied' });
          }
        } else {
          dm = await DirectMessage.findOne({
            participants: { $all: [socket.userId, recipientId] }
          });
        }

        if (!dm && recipientId) {
          dm = await DirectMessage.create({
            participants: [socket.userId, recipientId]
          });
          
          // Both users should join this DM room
          const recipientSocket = activeUsers.get(recipientId);
          if (recipientSocket) {
            io.sockets.sockets.get(recipientSocket)?.join(`dm:${dm._id}`);
          }
          socket.join(`dm:${dm._id}`);
        } else if (dm) {
          // Ensure socket is in the DM room
          socket.join(`dm:${dm._id}`);
        }

        // Create message
        const message = await Message.create({
          content: content || '',
          sender: socket.userId,
          directMessage: dm._id,
          media: media || null
        });

        // Populate sender info
        await message.populate('sender', 'name email avatar');

        // Update DM's last message
        dm.lastMessage = message._id;
        dm.lastMessageAt = new Date();
        await dm.save();

        // Emit to both participants
        io.to(`dm:${dm._id}`).emit('new-direct-message', message);

      } catch (error) {
        console.error('Error sending direct message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { roomId, dmId } = data;
      if (roomId) {
        socket.to(`room:${roomId}`).emit('user-typing', {
          userId: socket.userId,
          userName: socket.user.name
        });
      } else if (dmId) {
        socket.to(`dm:${dmId}`).emit('user-typing', {
          userId: socket.userId,
          userName: socket.user.name
        });
      }
    });

    // Handle stop typing
    socket.on('stop-typing', (data) => {
      const { roomId, dmId } = data;
      if (roomId) {
        socket.to(`room:${roomId}`).emit('user-stop-typing', {
          userId: socket.userId
        });
      } else if (dmId) {
        socket.to(`dm:${dmId}`).emit('user-stop-typing', {
          userId: socket.userId
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${socket.userId})`);
      
      activeUsers.delete(socket.userId);
      
      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        online: false,
        lastSeen: new Date()
      });

      // Emit user offline status to all clients
      io.emit('user-offline', { userId: socket.userId });
    });
  });
};
