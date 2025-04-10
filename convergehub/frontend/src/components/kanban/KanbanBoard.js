import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

// Create axios instance with base URL
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development" ? "http://localhost:5000" : "",
  timeout: 10000,
});

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState({
    tasks: false,
    addTask: false,
    deleteTask: false,
    updateTask: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch tasks on component mount
  const fetchTasks = async () => {
    setLoading((prev) => ({ ...prev, tasks: true }));
    try {
      const response = await api.get("/api/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Fetch tasks error:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to load tasks",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddTaskSubmit = async () => {
    if (!newTask.title.trim()) {
      showSnackbar("Task title is required", "error");
      return;
    }

    setLoading((prev) => ({ ...prev, addTask: true }));
    try {
      const response = await api.post("/api/tasks", newTask);
      setTasks((prev) => [...prev, response.data]);
      setNewTask({ title: "", description: "", status: "todo" });
      setOpenDialog(false);
      showSnackbar("Task added successfully");
    } catch (error) {
      console.error("Add task error:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to add task",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, addTask: false }));
    }
  };

  const handleDeleteTask = async (taskId) => {
    setLoading((prev) => ({ ...prev, deleteTask: true }));
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      showSnackbar("Task deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to delete task",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, deleteTask: false }));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTasks = [...tasks];

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    setLoading((prev) => ({ ...prev, updateTask: true }));
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error("Status update error:", error);
      // Revert on error
      setTasks(originalTasks);
      showSnackbar(
        error.response?.data?.message || "Failed to update task status",
        "error"
      );
    } finally {
      setLoading((prev) => ({ ...prev, updateTask: false }));
    }
  };

  const columns = {
    todo: { name: "To Do", items: tasks.filter((t) => t.status === "todo") },
    inProgress: {
      name: "In Progress",
      items: tasks.filter((t) => t.status === "inProgress"),
    },
    completed: {
      name: "Completed",
      items: tasks.filter((t) => t.status === "completed"),
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Kanban Board
      </Typography>

      <Button
        variant="contained"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Add New Task
      </Button>

      {loading.tasks && tasks.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 3 }}>
          {Object.entries(columns).map(([columnId, column]) => (
            <Box key={columnId} sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {column.name} ({column.items.length})
              </Typography>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  p: 2,
                  minHeight: "500px",
                  boxShadow: 1,
                }}
              >
                {column.items.map((task) => (
                  <Card key={task._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6">{task.title}</Typography>
                        <IconButton
                          onClick={() => handleDeleteTask(task._id)}
                          size="small"
                          color="error"
                          disabled={loading.deleteTask}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      {task.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {task.description}
                        </Typography>
                      )}
                      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                        <Select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task._id, e.target.value)
                          }
                          disabled={loading.updateTask}
                        >
                          <MenuItem value="todo">To Do</MenuItem>
                          <MenuItem value="inProgress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        Updated: {new Date(task.updatedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Add Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title *"
            fullWidth
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2 }}
            error={!newTask.title.trim()}
            helperText={!newTask.title.trim() ? "Title is required" : ""}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              onChange={(e) =>
                setNewTask({ ...newTask, status: e.target.value })
              }
              label="Status"
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="inProgress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddTaskSubmit}
            disabled={!newTask.title.trim() || loading.addTask}
            startIcon={loading.addTask ? <CircularProgress size={20} /> : null}
          >
            {loading.addTask ? "Adding..." : "Add Task"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanBoard;
