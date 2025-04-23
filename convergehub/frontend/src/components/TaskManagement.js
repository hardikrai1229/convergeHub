import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import KanbanBoard from "./kanban/KanbanBoard";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;


const TaskManagement = () => {
  const [connectionState, setConnectionState] = useState({
    isLoading: true,
    error: null,
    retryCount: 0,
  });

  // Connection test with timeout and retries
  const testConnection = async () => {
    try {
      // Try basic endpoint first
      await axios.get(`${API_BASE_URL}/`, {
        timeout: 5000, // 5 second timeout
      });

      // Then test API endpoint
      await axios.get(`${API_BASE_URL}/api/tasks`, {
        timeout: 5000, // 5 second timeout
      });
      return true;
    } catch (err) {
      console.error("Connection test failed:", err);
      throw err;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setConnectionState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        await testConnection();

        setConnectionState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        let errorMessage = "Could not connect to the server";

        if (err.code === "ECONNABORTED") {
          errorMessage = "Server is not responding. Please try again later.";
        } else if (err.response) {
          if (err.response.status === 404) {
            errorMessage =
              "API endpoint not found. Please check server configuration.";
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage =
            "No response from server. Check your network connection.";
        }

        setConnectionState((prev) => ({
          ...prev,
          isLoading: false,
          error: new Error(errorMessage),
        }));
      }
    };

    initialize();
  }, [connectionState.retryCount]);

  const handleRetry = () => {
    setConnectionState((prev) => ({
      ...prev,
      retryCount: prev.retryCount + 1,
    }));
  };

  if (connectionState.error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Failed to Initialize Task Board
        </Typography>

        <Alert severity="error" sx={{ mb: 3, maxWidth: "500px" }}>
          {connectionState.error.message}
          <Box sx={{ mt: 1, fontSize: "0.875rem" }}>
            Please check:
            <ul
              style={{
                textAlign: "left",
                paddingLeft: "20px",
                margin: "8px 0",
              }}
            >
              <li>Your internet connection</li>
              <li>Backend server status</li>
              <li>API endpoint availability</li>
            </ul>
          </Box>
        </Alert>

        <Button
          variant="contained"
          onClick={handleRetry}
          size="large"
          sx={{ mt: 2 }}
          startIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
                fill="currentColor"
              />
            </svg>
          }
        >
          Retry Connection
        </Button>
      </Box>
    );
  }

  if (connectionState.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 3 }}>
          Connecting to Task Service...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  return (
    <KanbanBoard
      onError={(err) => setConnectionState((prev) => ({ ...prev, error: err }))}
    />
  );
};

export default TaskManagement;
