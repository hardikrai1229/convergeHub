import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isSignedIn } = useUser();

  // If the user is not signed in, redirect to the login page
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // If the user is signed in, render the children (protected content)
  return children;
}

export default ProtectedRoute;