const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Member', 'Guest'], default: 'Member' },
    profilePicture: { type: String, default: '' },
    status: { type: String, enum: ['Online', 'Offline', 'Busy'], default: 'Online' },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
