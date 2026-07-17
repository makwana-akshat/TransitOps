import React, { useLayoutEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiClient } from '@/lib/apiClient';

export function ApiInterceptor({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [isAttached, setIsAttached] = useState(false);

  useLayoutEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        try {
          // Fetch the Clerk JWT token dynamically for every outgoing request
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Failed to attach Clerk token to request", error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    setIsAttached(true);

    return () => {
      // Clean up the interceptor when unmounting
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  if (!isAttached) return null;

  return <>{children}</>;
}
