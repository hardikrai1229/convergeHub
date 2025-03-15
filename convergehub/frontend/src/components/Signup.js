import React from 'react';
import { SignUp, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {
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
      <SignUp />
    </div>
  );
}

export default SignUpPage;