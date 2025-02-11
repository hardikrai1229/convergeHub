// backend/controllers/userController.js
const User = require('../models/User');

// Get user details
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        const { username, email, profilePicture } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, profilePicture },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getUser,
    updateUser,
};