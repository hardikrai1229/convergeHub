// src/components/ChannelList.js
import React from "react";

function ChannelList() {
  const channels = [
    "Direct Messages",
    "Collaborative Documents ",
    "Public Channels ",
    "File-Sharing ",
    "Support & Help Desk",
  ]; // Example channels

  return (
    <div style={styles.container}>
      <h2>Channels</h2>
      <ul style={styles.list}>
        {channels.map((channel, index) => (
          <li key={index} style={styles.item}>
            {channel}
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
    width: "200px",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #ddd",
  },
};

export default ChannelList;
