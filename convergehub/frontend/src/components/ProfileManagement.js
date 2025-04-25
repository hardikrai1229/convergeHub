import React, { useState } from "react";
import { auth } from "../firebase";
import { updateProfile, updateEmail, deleteUser } from "firebase/auth";
import { motion } from "framer-motion";

const ProfileManagement = ({ user, onClose }) => {
  const [username, setUsername] = useState(user.displayName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [error, setError] = useState("");

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: username });
      await updateEmail(auth.currentUser, email);
      alert("Profile updated successfully!");
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await deleteUser(auth.currentUser);
        alert("Account deleted successfully!");
        onClose();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg w-80 text-center z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4">Manage Profile</h2>
      {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleUpdateProfile}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-2"
      >
        Update Profile
      </button>
      <button
        onClick={handleDeleteAccount}
        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition mb-2"
      >
        Delete Account
      </button>
      <button
        onClick={onClose}
        className="w-full bg-gray-300 text-black py-2 rounded-md hover:bg-gray-400 transition"
      >
        Close
      </button>
    </motion.div>
  );
};

export default ProfileManagement;
