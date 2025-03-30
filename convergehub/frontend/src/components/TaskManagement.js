import React from "react";
import KanbanBoard from "./kanban/KanbanBundle";

import "./kanban/KanbanStyles.css";

function TaskManagement() {
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#1e293b",
          }}
        >
          ✅ Task Management
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#64748b",
            maxWidth: "800px",
          }}
        >
          Manage your project tasks using our Kanban board. Drag and drop tasks
          between columns to update their status.
        </p>
      </div>

      <div
        style={{
          height: "calc(100vh - 200px)",
          minHeight: "500px",
          marginTop: "20px",
        }}
      >
        <KanbanBoard />
      </div>
    </div>
  );
}

export default TaskManagement;
