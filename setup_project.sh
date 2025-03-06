#!/bin/bash

# Install backend dependencies
echo "Installing backend dependencies..."
mkdir -p convergehub/backend
cd convergehub/backend
npm init -y
npm install express mongoose bcrypt jsonwebtoken cors dotenv
cd ../..

# Install frontend dependencies
echo "Installing frontend dependencies..."
mkdir -p convergehub/frontend
cd convergehub/frontend
npx create-react-app .
npm install react-router-dom axios
cd ../..

# Create the project folder structure
echo "Creating folder structure..."
mkdir -p convergehub/{backend,frontend}

# Backend structure
mkdir -p convergehub/backend/{controllers,models,routes,config,middleware}

# Create backend files with pre-written code

# Models
cat <<EOT > convergehub/backend/models/User.js
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
EOT

cat <<EOT > convergehub/backend/models/Channel.js
const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    channelName: { type: String, required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    isPrivate: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports = mongoose.model('Channel', channelSchema);
EOT

cat <<EOT > convergehub/backend/models/Message.js
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
EOT

# Routes
cat <<EOT > convergehub/backend/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
EOT

cat <<EOT > convergehub/backend/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

module.exports = router;
EOT

# Server
cat <<EOT > convergehub/backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Database connection
mongoose.connect('mongodb://localhost:27017/convergehub', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Start server
app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
EOT

# Frontend structure
mkdir -p convergehub/frontend/{public,src/components,src/styles}

# Create frontend files with pre-written code

# App.js
cat <<EOT > convergehub/frontend/src/App.js
import React from 'react';
import Navbar from './components/Navbar';
import ChannelList from './components/ChannelList';
import Chat from './components/Chat';

function App() {
    return (
        <div className="App">
            <Navbar />
            <div className="main-content">
                <ChannelList />
                <Chat />
            </div>
        </div>
    );
}

export default App;
EOT

# index.html
cat <<EOT > convergehub/frontend/public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ConvergeHub</title>
</head>
<body>
    <div id="root"></div>
    <script src="/src/index.js"></script>
</body>
</html>
EOT

# index.js
cat <<EOT > convergehub/frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
EOT

# Navbar.js
cat <<EOT > convergehub/frontend/src/components/Navbar.js
import React from 'react';

function Navbar() {
    return (
        <nav>
            <h1>ConvergeHub</h1>
        </nav>
    );
}

export default Navbar;
EOT

# README
cat <<EOT > convergehub/README.md
# ConvergeHub

A real-time collaboration platform for team communication.

## Features
- Real-time messaging
- Channels and workspaces
- File sharing
- Voice and video calls

## Setup
1. Clone the repository.
2. Run \`npm install\` in both \`backend\` and \`frontend\` folders.
3. Start the backend server: \`node backend/server.js\`.
4. Start the frontend: \`npm start\` in the \`frontend\` folder.
EOT

echo "Project setup complete! 🚀"
