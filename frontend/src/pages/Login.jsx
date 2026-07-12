import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <SignIn routing="path" path="/login" />
    </div>
  );
};

export default Login;
