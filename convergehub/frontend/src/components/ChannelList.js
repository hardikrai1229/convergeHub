import React from "react";
import { useNavigate } from "react-router-dom";

function ChannelList() {
  const navigate = useNavigate();

  const channels = [
    { name: "💬 Direct Messages", path: "/chat" },
    { name: "📄 Collaborative Editor", path: "/editor" },
    { name: "📂 File Sharing", path: "/file-sharing" },
    { name: "✅ Task Management", path: "/tasks" },
    { name: "🆘 Support & Help Desk", path: "/support" },
  ];

  return (
    <div style={styles.container}>
      <h2>Channels</h2>
      <ul style={styles.list}>
        {channels.map((channel, index) => (
          <li
            key={index}
            style={styles.item}
            onClick={() => navigate(channel.path)}
          >
            {channel.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    borderRight: "1px solid #ddd",
    width: "220px",
    backgroundColor: "#f8f9fa",
    height: "100vh",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    padding: "12px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    transition: "background 0.3s",
  },
  itemHover: {
    backgroundColor: "#e9e9e9",
  },
};

export default ChannelList;
