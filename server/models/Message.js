import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: String,
    type: {
      type: String,
      enum: ['image', 'file'],
    },
    filename: String,
    size: Number,
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return !this.media;
      },
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: function () {
        return !this.directMessage;
      },
    },

    directMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DirectMessage',
      required: function () {
        return !this.room;
      },
    },

    media: {
      type: mediaSchema,
      default: null,   // ✅ correct place for default
    },

    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ directMessage: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
