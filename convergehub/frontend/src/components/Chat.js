// src/components/Chat.js
import React, { useState } from 'react';
import FriendList from './FriendList';

function Chat() {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello!', sender: 'User1' },
        { id: 2, text: 'Hi there!', sender: 'User2' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (newMessage.trim()) {
            setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: 'You' }]);
            setNewMessage('');
        }
    };

    return (
        <div style={styles.container}>
            <FriendList />
        </div>
    );
}

const styles = {
    container: {
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
};

export default Chat;