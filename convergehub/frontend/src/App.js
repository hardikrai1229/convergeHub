import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import ChannelList from "./components/ChannelList";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import CollaborativeEditor from "./components/CollaborativeEditor";
import FileSharing from "./components/FileSharing";
import TaskManagement from "./components/TaskManagement";
import HeroHeader29 from "./components/HeroHeader29";
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 🆕

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div style={styles.app}>
        <Navbar user={user} onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div style={styles.content}>
          {/* Sidebar */}
          <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-0"} overflow-hidden`}>
            <ChannelList />
          </div>

          {/* Main Content */}
          <main style={styles.mainContent}>
            <AppRoutes user={user} />
          </main>
        </div>
      </div>
    </Router>
  );
}

function AppRoutes({ user }) {
  return (
    <Routes>
      <Route
        path="/chat"
        element={
          <ProtectedRoute user={user}>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor"
        element={
          <ProtectedRoute user={user}>
            <CollaborativeEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/file-sharing"
        element={
          <ProtectedRoute user={user}>
            <FileSharing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute user={user}>
            <TaskManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute user={user}>
            <h2>Support & Help Desk</h2>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route path="/" element={<HeroHeader29 />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

const styles = {
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
  },
  content: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    height: "100%",
    width: "100%",
    padding: 0,
    margin: 0,
    overflowY: "auto",
    backgroundColor: "#1f2937", // Optional: Tailwind's gray-800
  },
};

export default App;
