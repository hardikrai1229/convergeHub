/**
 * Kanban Board Bundle for ConvergeHub
 *
 * This file contains all the necessary components and logic for the Kanban board.
 * It's designed to be easy to integrate into the ConvergeHub application.
 */

import React, { useState, useEffect, useMemo } from "react";
import { create } from "zustand";
import "./KanbanStyles.css";

// Types
/**
 * @typedef {'low' | 'medium' | 'high'} Priority
 * @typedef {'create' | 'edit'} ModalMode
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Priority} priority
 * @property {string} columnId
 *
 * @typedef {Object} Column
 * @property {string} id
 * @property {string} title
 * @property {string[]} taskIds
 *
 * @typedef {Object} TaskModalState
 * @property {boolean} isOpen
 * @property {Task | null} currentTask
 * @property {ModalMode} mode
 * @property {string} [preselectedColumn]
 *
 * @typedef {Object} DeleteModalState
 * @property {boolean} isOpen
 * @property {string | null} taskId
 */

// Initial State
const initialState = {
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Create project documentation",
      description: "Write comprehensive documentation for the new project",
      priority: "medium",
      columnId: "column-1",
    },
    "task-2": {
      id: "task-2",
      title: "Design UI mockups",
      description: "Create mockups for all main screens",
      priority: "high",
      columnId: "column-1",
    },
    "task-3": {
      id: "task-3",
      title: "Implement authentication",
      description: "Integrate JWT authentication",
      priority: "high",
      columnId: "column-2",
    },
    "task-4": {
      id: "task-4",
      title: "Set up CI/CD pipeline",
      description:
        "Configure GitHub actions for automated testing and deployment",
      priority: "medium",
      columnId: "column-2",
    },
    "task-5": {
      id: "task-5",
      title: "User testing",
      description: "Conduct user testing sessions",
      priority: "low",
      columnId: "column-3",
    },
  },
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      taskIds: ["task-1", "task-2"],
    },
    "column-2": {
      id: "column-2",
      title: "In Progress",
      taskIds: ["task-3", "task-4"],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: ["task-5"],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
  taskModal: {
    isOpen: false,
    currentTask: null,
    mode: "create",
    preselectedColumn: null,
  },
  deleteModal: {
    isOpen: false,
    taskId: null,
  },
};

// Kanban Store
export const useKanbanStore = create((set) => ({
  ...initialState,

  // Task operations
  moveTask: (taskId, sourceColumnId, destinationColumnId, newIndex) => {
    set((state) => {
      // Make sure the task exists
      if (!state.tasks[taskId]) {
        return state;
      }

      // Make sure both columns exist
      if (
        !state.columns[sourceColumnId] ||
        !state.columns[destinationColumnId]
      ) {
        return state;
      }

      // Remove the task from the source column
      const newSourceTaskIds = [
        ...state.columns[sourceColumnId].taskIds,
      ].filter((id) => id !== taskId);

      // Get the current destination taskIds
      let newDestTaskIds = [...state.columns[destinationColumnId].taskIds];

      // If newIndex is specified, insert at that position, otherwise append to the end
      if (
        typeof newIndex === "number" &&
        newIndex >= 0 &&
        newIndex <= newDestTaskIds.length
      ) {
        newDestTaskIds.splice(newIndex, 0, taskId);
      } else {
        newDestTaskIds.push(taskId);
      }

      // Create the updated task with the new columnId
      const updatedTask = {
        ...state.tasks[taskId],
        columnId: destinationColumnId,
      };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: updatedTask,
        },
        columns: {
          ...state.columns,
          [sourceColumnId]: {
            ...state.columns[sourceColumnId],
            taskIds: newSourceTaskIds,
          },
          [destinationColumnId]: {
            ...state.columns[destinationColumnId],
            taskIds: newDestTaskIds,
          },
        },
      };
    });
  },

  addTask: (taskData) => {
    set((state) => {
      // Generate a unique ID for the new task
      const taskId = `task-${Date.now()}`;

      // Create the new task
      const newTask = {
        id: taskId,
        title: taskData.title,
        description: taskData.description || "",
        priority: taskData.priority || "medium",
        columnId: taskData.columnId,
      };

      // Add the task ID to the specified column
      const updatedColumn = {
        ...state.columns[taskData.columnId],
        taskIds: [...state.columns[taskData.columnId].taskIds, taskId],
      };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: newTask,
        },
        columns: {
          ...state.columns,
          [taskData.columnId]: updatedColumn,
        },
      };
    });
  },

  updateTask: (taskId, taskData) => {
    set((state) => {
      // Get the existing task
      const existingTask = state.tasks[taskId];
      if (!existingTask) {
        return state;
      }

      // Check if column has changed
      const hasColumnChanged = existingTask.columnId !== taskData.columnId;

      // Create updated task
      const updatedTask = {
        ...existingTask,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        columnId: taskData.columnId,
      };

      // If the column hasn't changed, just update the task
      if (!hasColumnChanged) {
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [taskId]: updatedTask,
          },
        };
      }

      // If the column has changed, we need to update the taskIds arrays in both columns
      const oldColumn = state.columns[existingTask.columnId];
      const newColumn = state.columns[taskData.columnId];

      const updatedOldColumn = {
        ...oldColumn,
        taskIds: oldColumn.taskIds.filter((id) => id !== taskId),
      };

      const updatedNewColumn = {
        ...newColumn,
        taskIds: [...newColumn.taskIds, taskId],
      };

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: updatedTask,
        },
        columns: {
          ...state.columns,
          [existingTask.columnId]: updatedOldColumn,
          [taskData.columnId]: updatedNewColumn,
        },
      };
    });
  },

  deleteTask: (taskId) => {
    set((state) => {
      // Make sure the task exists
      const taskToDelete = state.tasks[taskId];
      if (!taskToDelete) {
        return state;
      }

      // Remove the task from its column
      const columnId = taskToDelete.columnId;
      const updatedColumn = {
        ...state.columns[columnId],
        taskIds: state.columns[columnId].taskIds.filter((id) => id !== taskId),
      };

      // Create a copy of tasks without the deleted task
      const { [taskId]: _, ...remainingTasks } = state.tasks;

      return {
        ...state,
        tasks: remainingTasks,
        columns: {
          ...state.columns,
          [columnId]: updatedColumn,
        },
      };
    });
  },

  // Modal operations
  openTaskModal: (mode, taskId = null, columnId = null) => {
    set((state) => {
      const currentTask = taskId ? state.tasks[taskId] : null;

      return {
        ...state,
        taskModal: {
          isOpen: true,
          mode,
          currentTask,
          preselectedColumn: columnId,
        },
      };
    });
  },

  closeTaskModal: () => {
    set((state) => ({
      ...state,
      taskModal: {
        ...state.taskModal,
        isOpen: false,
        currentTask: null,
      },
    }));
  },

  openDeleteModal: (taskId) => {
    set((state) => ({
      ...state,
      deleteModal: {
        isOpen: true,
        taskId,
      },
    }));
  },

  closeDeleteModal: () => {
    set((state) => ({
      ...state,
      deleteModal: {
        ...state.deleteModal,
        isOpen: false,
        taskId: null,
      },
    }));
  },
}));

// Components

// Task Card Component
export function TaskCard({ task, index, onDragStart, onDragEnd }) {
  const openTaskModal = useKanbanStore((state) => state.openTaskModal);
  const openDeleteModal = useKanbanStore((state) => state.openDeleteModal);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 priority-high";
      case "medium":
        return "bg-yellow-100 text-yellow-800 priority-medium";
      case "low":
        return "bg-green-100 text-green-800 priority-low";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Normal";
    }
  };

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => openTaskModal("edit", task.id)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <h4 style={{ fontWeight: "500", color: "#1e293b", margin: "0" }}>
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            openDeleteModal(task.id);
          }}
          style={{
            color: "#94a3b8",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
          aria-label="Delete task"
        >
          &times;
        </button>
      </div>

      {task.description && (
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px" }}>
          {task.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>
    </div>
  );
}

// Kanban Column Component
export function KanbanColumn({ column, tasks, onDrop }) {
  const openTaskModal = useKanbanStore((state) => state.openTaskModal);

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");

    // Call the onDrop handler passed from the parent
    onDrop(taskId, sourceColumnId, column.id);
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("sourceColumnId", task.columnId);

    // Set the drag image (optional)
    const dragImage = document.createElement("div");
    dragImage.classList.add("drag-ghost");
    dragImage.textContent = task.title;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    // Style updates during drag
    e.target.style.opacity = "0.4";

    // Clean up the temporary drag image element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  return (
    <div
      className="kanban-column"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <h3>{column.title}</h3>
      </div>

      <div className="column-tasks">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      <div className="column-footer">
        <button
          className="add-task-button"
          onClick={() => openTaskModal("create", null, column.id)}
        >
          + Add a task
        </button>
      </div>
    </div>
  );
}

// Task Modal Component
export function TaskModal() {
  const taskModal = useKanbanStore((state) => state.taskModal);
  const columns = useKanbanStore((state) => state.columns);
  const closeTaskModal = useKanbanStore((state) => state.closeTaskModal);
  const addTask = useKanbanStore((state) => state.addTask);
  const updateTask = useKanbanStore((state) => state.updateTask);

  // Form state
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    priority: "medium",
    columnId: "",
  });

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (taskModal.isOpen) {
      if (taskModal.mode === "edit" && taskModal.currentTask) {
        // Edit mode - populate form with current task data
        setFormState({
          title: taskModal.currentTask.title,
          description: taskModal.currentTask.description,
          priority: taskModal.currentTask.priority,
          columnId: taskModal.currentTask.columnId,
        });
      } else {
        // Create mode - reset form and set preselected column if provided
        setFormState({
          title: "",
          description: "",
          priority: "medium",
          columnId:
            taskModal.preselectedColumn || Object.keys(columns)[0] || "",
        });
      }
    }
  }, [taskModal, columns]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formState.title.trim() === "") {
      return; // Don't submit empty tasks
    }

    if (taskModal.mode === "edit" && taskModal.currentTask) {
      updateTask(taskModal.currentTask.id, formState);
    } else {
      addTask(formState);
    }

    closeTaskModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  if (!taskModal.isOpen) {
    return null;
  }

  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem",
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "32rem",
      padding: "1.5rem",
    },
    header: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      marginBottom: "1rem",
    },
    formGroup: {
      marginBottom: "1rem",
    },
    label: {
      display: "block",
      color: "#4b5563",
      fontSize: "0.875rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
    },
    input: {
      width: "100%",
      padding: "0.5rem 0.75rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.25rem",
      backgroundColor: "white",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      fontSize: "1rem",
    },
    textarea: {
      width: "100%",
      padding: "0.5rem 0.75rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.25rem",
      backgroundColor: "white",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      fontSize: "1rem",
      minHeight: "6rem",
    },
    select: {
      width: "100%",
      padding: "0.5rem 0.75rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.25rem",
      backgroundColor: "white",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      fontSize: "1rem",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "1.5rem",
    },
    cancelButton: {
      marginRight: "0.5rem",
      padding: "0.5rem 1rem",
      backgroundColor: "#e5e7eb",
      color: "#1f2937",
      border: "none",
      borderRadius: "0.25rem",
      fontWeight: "bold",
      cursor: "pointer",
    },
    submitButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "0.25rem",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={modalStyles.header}>
          {taskModal.mode === "create" ? "Add New Task" : "Edit Task"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formState.title}
              onChange={handleInputChange}
              style={modalStyles.input}
              placeholder="Task title"
              required
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              style={modalStyles.textarea}
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label} htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formState.priority}
              onChange={handleInputChange}
              style={modalStyles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label} htmlFor="columnId">
              Status
            </label>
            <select
              id="columnId"
              name="columnId"
              value={formState.columnId}
              onChange={handleInputChange}
              style={modalStyles.select}
              required
            >
              <option value="" disabled>
                Select a status
              </option>
              {Object.values(columns).map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>

          <div style={modalStyles.buttonGroup}>
            <button
              type="button"
              style={modalStyles.cancelButton}
              onClick={closeTaskModal}
            >
              Cancel
            </button>
            <button type="submit" style={modalStyles.submitButton}>
              {taskModal.mode === "create" ? "Add Task" : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
export function DeleteConfirmationModal() {
  const deleteModal = useKanbanStore((state) => state.deleteModal);
  const closeDeleteModal = useKanbanStore((state) => state.closeDeleteModal);
  const deleteTask = useKanbanStore((state) => state.deleteTask);
  const tasks = useKanbanStore((state) => state.tasks);

  // Don't render anything if modal is closed
  if (!deleteModal.isOpen) {
    return null;
  }

  const task = deleteModal.taskId ? tasks[deleteModal.taskId] : null;

  const handleDelete = () => {
    if (deleteModal.taskId) {
      deleteTask(deleteModal.taskId);
    }
    closeDeleteModal();
  };

  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem",
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "32rem",
      padding: "1.5rem",
    },
    header: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      marginBottom: "1rem",
    },
    message: {
      marginBottom: "1.5rem",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "flex-end",
    },
    cancelButton: {
      marginRight: "0.5rem",
      padding: "0.5rem 1rem",
      backgroundColor: "#e5e7eb",
      color: "#1f2937",
      border: "none",
      borderRadius: "0.25rem",
      fontWeight: "bold",
      cursor: "pointer",
    },
    deleteButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "0.25rem",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={modalStyles.header}>Delete Task</h2>

        <p style={modalStyles.message}>
          Are you sure you want to delete{" "}
          <span style={{ fontWeight: "bold" }}>
            "{task?.title || "this task"}"
          </span>
          ? This action cannot be undone.
        </p>

        <div style={modalStyles.buttonGroup}>
          <button
            type="button"
            style={modalStyles.cancelButton}
            onClick={closeDeleteModal}
          >
            Cancel
          </button>
          <button
            type="button"
            style={modalStyles.deleteButton}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Kanban Board Component
export default function KanbanBoard() {
  // Use individual selectors to prevent unnecessary re-renders
  const tasks = useKanbanStore((state) => state.tasks);
  const columns = useKanbanStore((state) => state.columns);
  const columnOrder = useKanbanStore((state) => state.columnOrder);
  const moveTask = useKanbanStore((state) => state.moveTask);

  const handleDrop = (taskId, sourceColumnId, destinationColumnId) => {
    // Only process the drop if the columns are different
    if (sourceColumnId !== destinationColumnId) {
      moveTask(taskId, sourceColumnId, destinationColumnId);
    }
  };

  // Use useMemo to compute column tasks to prevent unnecessary recalculations
  const columnTasksMap = useMemo(() => {
    return columnOrder.reduce((acc, columnId) => {
      const column = columns[columnId];
      acc[columnId] = column.taskIds
        .map((taskId) => tasks[taskId])
        .filter(Boolean);
      return acc;
    }, {});
  }, [columnOrder, columns, tasks]);

  return (
    <div className="kanban-board">
      <div className="kanban-container">
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          const columnTasks = columnTasksMap[columnId];

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onDrop={handleDrop}
            />
          );
        })}
      </div>

      <TaskModal />
      <DeleteConfirmationModal />
    </div>
  );
}
