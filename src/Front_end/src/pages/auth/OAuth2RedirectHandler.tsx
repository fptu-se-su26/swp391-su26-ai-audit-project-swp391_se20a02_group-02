import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

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
            // Update the Zustand store using the existing initAuth
            await initAuth();
            toast.success('Login Successful', 'Welcome to LuxeWay!');
            
            navigate('/', { replace: true });
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
      <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
      <h2 className="text-xl font-semibold text-foreground">Processing Google Login...</h2>
      <p className="text-muted-foreground text-sm mt-2">Please wait while we secure your session.</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
