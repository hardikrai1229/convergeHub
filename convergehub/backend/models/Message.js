const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: { type: Map, of: Number, default: {} }
});

module.exports = mongoose.model('Message', messageSchema);
