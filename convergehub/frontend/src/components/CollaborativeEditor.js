import React, { useState, useEffect, useRef } from "react";
import "./CollaborativeEditor.css";

function CollaborativeEditor() {
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:5000");
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "init") {
          setDocument(message.content);
        } else if (message.type === "operation") {
          applyOperation(message.operation);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => newSocket.close();
  }, []);

  const applyOperation = (operation) => {
    const { type, index, value } = operation;
    setDocument((prev) => {
      if (type === "insert") {
        return prev.slice(0, index) + value + prev.slice(index);
      }
      if (type === "delete") {
        return prev.slice(0, index) + prev.slice(index + value.length);
      }
      return prev;
    });
  };

  const handleChange = (e) => {
    const newDocument = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const diff = newDocument.length - document.length;

    let operation = null;
    if (diff > 0) {
      operation = {
        type: "insert",
        index: cursorPosition - diff,
        value: newDocument.slice(cursorPosition - diff, cursorPosition),
      };
    } else if (diff < 0) {
      operation = {
        type: "delete",
        index: cursorPosition,
        value: document.slice(cursorPosition, cursorPosition - diff),
      };
    }

    if (operation && socket) {
      socket.send(JSON.stringify({ type: "operation", operation }));
    }

    setDocument(newDocument);
  };

  return (
    <div className="App">
      <h1>Collaborative Editor</h1>
      <textarea
        ref={textareaRef}
        value={document}
        onChange={handleChange}
        rows="20"
        cols="80"
      />
    </div>
  );
}

export default CollaborativeEditor;
