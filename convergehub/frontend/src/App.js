// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChannelList from './components/ChannelList';
import Chat from './components/Chat';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div style={styles.app}>
                <Navbar />
                <div style={styles.content}>
                    <ChannelList />
                    <Routes>
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/" element={<div style={styles.welcome}>Welcome to ConvergeHub!</div>} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

const styles = {
    app: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    content: {
        display: 'flex',
        flex: 1,
    },
    welcome: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '24px',
    },
};

export default App;