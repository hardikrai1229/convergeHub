import React from 'react';
import { SignIn, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // Redirect to Home if the user is already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <SignIn />
    </div>
  );
}

export default Login;