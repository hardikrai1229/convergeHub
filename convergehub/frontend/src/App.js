import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ChannelList from "./components/ChannelList";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import CollaborativeEditor from "./components/CollaborativeEditor";
import FileSharing from "./components/FileSharing";
import TaskManagement from "./components/TaskManagement";
import { useUser } from "@clerk/clerk-react";

function App() {
  return (
    <Router>
      <div style={styles.app}>
        <Navbar />
        <div style={styles.content}>
          <ChannelList />
          <AppRoutes />
        </div>
      </div>
    </Router>
  );
}

// ✅ AppRoutes Component (All Routes here)
function AppRoutes() {
  const { user } = useUser();

  return (
    <Routes>
      {/* ✅ Chat Page */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* ✅ Collaborative Editor */}
      <Route
        path="/editor"
        element={
          <ProtectedRoute>
            <CollaborativeEditor />
          </ProtectedRoute>
        }
      />

      {/* ✅ File Sharing */}
      <Route
        path="/file-sharing"
        element={
          <ProtectedRoute>
            <FileSharing />
          </ProtectedRoute>
        }
      />

      {/* ✅ Task Management */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TaskManagement />
          </ProtectedRoute>
        }
      />

      {/* ✅ Support Page */}
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <h2>Support & Help Desk</h2>
          </ProtectedRoute>
        }
      />

      {/* ✅ Login/Signup */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ✅ Welcome Page */}
      <Route
        path="/"
        element={
          <div style={styles.welcome}>
            Welcome to ConvergeHub!
            {user && <p>Hello, {user.firstName}!</p>}
          </div>
        }
      />
    </Routes>
  );
}

const styles = {
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  content: {
    display: "flex",
    flex: 1,
  },
  welcome: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
  },
};

export default App;
