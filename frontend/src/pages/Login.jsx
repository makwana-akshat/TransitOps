import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="flex justify-center">
      <SignIn routing="path" path="/login" signUpUrl="/signup" />
    </div>
  );
};

export default Login;
