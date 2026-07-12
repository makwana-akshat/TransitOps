import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  
  const [dbUser, setDbUser] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoaded && isSignedIn && clerkUser) {
        try {
          const token = await getToken();
          const authHeaders = {
            headers: { Authorization: `Bearer ${token}` }
          };

          // 1. Sync the user (JIT Provisioning)
          try {
            const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
            await axios.post('http://localhost:8000/api/auth/sync-user', {
              email: clerkUser.primaryEmailAddress?.emailAddress,
              full_name: fullName,
              avatar_url: clerkUser.imageUrl || ""
            }, authHeaders);
          } catch (syncError) {
            console.error("Failed to sync user with backend:", syncError);
          }

          // 2. Fetch the profile
          const response = await axios.get('http://localhost:8000/api/auth/me', authHeaders);
          
          setDbUser(response.data.user);
          setRole(response.data.role);
          setPermissions(response.data.permissions || []);
        } catch (error) {
          console.error("Failed to fetch database user profile:", error);
          setDbUser(null);
          setRole(null);
          setPermissions([]);
        } finally {
          setAuthLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setDbUser(null);
        setRole(null);
        setPermissions([]);
        setAuthLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  return (
    <AuthContext.Provider value={{
      isLoaded,
      isSignedIn,
      authLoading,
      clerkUser,
      dbUser,
      role,
      permissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => useContext(AuthContext);
