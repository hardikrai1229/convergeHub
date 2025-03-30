// src/index.js
import React from "react";
import ReactDOM from "react-dom/client"; // Import from 'react-dom/client' instead of 'react-dom'
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";
const clerkPubKey =
  "pk_test_ZGVzaXJlZC1vY3RvcHVzLTkwLmNsZXJrLmFjY291bnRzLmRldiQ";

const root = ReactDOM.createRoot(document.getElementById("root")); // Create a root using createRoot
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
