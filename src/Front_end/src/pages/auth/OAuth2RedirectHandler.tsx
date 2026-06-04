import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';
import type { User } from '@/types';

// Redirect logged-in users to Homepage to show logged-in state after Google login
const getRoleBasedDashboard = (user: User | null): string => {
  return '/';
};

export const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refresh_token');

    if (token) {
      localStorage.setItem('luxeway_access_token', token);
      if (refreshToken) {
        localStorage.setItem('luxeway_refresh_token', refreshToken);
      }

      const fetchUser = async () => {
        try {
          const user = await authService.fetchCurrentUser();
          if (user) {
            // Sync the Zustand store with the freshly fetched user
            await initAuth();
            toast.success('Login Successful', 'Welcome to LuxeWay!');
            
            // BUG-8 FIX: Navigate to the role-appropriate dashboard, not '/'
            navigate(getRoleBasedDashboard(user), { replace: true });
          } else {
            toast.error('Authentication Failed', 'Failed to retrieve user profile.');
            navigate('/auth/login', { replace: true });
          }
        } catch (err: any) {
          toast.error('Authentication Error', err.message || 'An error occurred during Google authentication.');
          navigate('/auth/login', { replace: true });
        }
      };

      fetchUser();
    } else {
      toast.error('Authentication Failed', 'No token was provided by Google.');
      navigate('/auth/login', { replace: true });
    }
  }, [location, navigate, toast, initAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
        <div className="absolute inset-0 rounded-full blur-xl bg-accent/20 animate-pulse" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mt-4">Processing Google Login...</h2>
      <p className="text-muted-foreground text-sm mt-2">Please wait while we secure your session.</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
