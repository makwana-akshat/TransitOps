import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Signup = () => {
  return (
    <div className="flex justify-center">
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  );
};

export default Signup;
