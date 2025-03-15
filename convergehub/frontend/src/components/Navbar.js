// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';


function Navbar() {
    return (
        <nav style={styles.nav}>
            <h1 style={styles.title}>ConvergeHub</h1>
            <ul style={styles.menu}>
                <li><Link to="/" style={styles.link}>Home</Link></li>
                <li><Link to="/login" style={styles.link}>Login</Link></li>
                <li><Link to="/signup" style={styles.link}>Signup</Link></li>
                <li>&nbsp;&nbsp;&nbsp;</li>
                <UserButton afterSignOutUrl="/" />
            </ul>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
    },
    title: {
        margin: 0,
        fontSize: '24px',
    },
    menu: {
        listStyle: 'none',
        display: 'flex',
        margin: 0,
        padding: 0,
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        marginLeft: '20px',
        fontSize: '18px',
    },
};

export default Navbar;