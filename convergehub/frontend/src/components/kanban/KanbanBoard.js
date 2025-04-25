import React, { useState, useEffect } from "react";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";
const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? API_BASE_URL : "",
  timeout: 10000,
});

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" });
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      setNotification("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return setNotification("Task title is required");

    setLoading(true);
    try {
      const res = await api.post("/api/tasks", newTask);
      setTasks((prev) => [...prev, res.data]);
      setNewTask({ title: "", description: "", status: "todo" });
      setOpenDialog(false);
      setNotification("Task added successfully");
    } catch (err) {
      setNotification("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setNotification("Task deleted");
    } catch {
      setNotification("Delete failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    const original = [...tasks];
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));

    try {
      await api.put(`/api/tasks/${id}`, { status });
    } catch {
      setTasks(original);
      setNotification("Update failed");
    }
  };

  const columns = {
    todo: { name: "To Do", items: tasks.filter((t) => t.status === "todo") },
    inProgress: { name: "In Progress", items: tasks.filter((t) => t.status === "inProgress") },
    completed: { name: "Completed", items: tasks.filter((t) => t.status === "completed") },
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-white">Kanban Board</h1>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mb-6"
        onClick={() => setOpenDialog(true)}
      >
        Add Task
      </button>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="flex gap-6">
          {Object.entries(columns).map(([key, column]) => (
            <div key={key} className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-white">
                {column.name} ({column.items.length})
              </h2>
              <div className="bg-white rounded shadow p-4 min-h-[400px] space-y-4">
                {column.items.map((task) => (
                  <div key={task._id} className="p-4 border rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      <button onClick={() => handleDelete(task._id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="mt-3 w-full border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="todo">To Do</option>
                      <option value="inProgress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated: {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <select
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTask.status}
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border rounded" onClick={() => setOpenDialog(false)}>
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={handleAddTask}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow">
          {notification}
          <button className="ml-3" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
