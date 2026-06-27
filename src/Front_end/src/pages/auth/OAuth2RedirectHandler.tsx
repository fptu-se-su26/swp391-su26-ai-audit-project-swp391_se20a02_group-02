import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/Toast';
import { Loader2, AlertCircle } from 'lucide-react';
import type { User } from '@/types';

// Redirect logged-in users to their role-specific dashboards or homepage after Google login
const getRoleBasedDashboard = (user: User | null): string => {
  if (!user) return '/';
  const role = user.role?.toLowerCase();
  const accountType = user.accountType?.toUpperCase();

  if (role === 'admin' || role === 'super_admin') {
    return '/admin';
  }
  if (role === 'owner') {
    if (accountType === 'BUSINESS') {
      return '/business';
    }
    return '/owner';
  }
  return '/';
};

export const OAuth2RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { initAuth } = useAuthStore();
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refresh_token');
    // Handle OAuth2 error parameters from Google (e.g., error=access_denied, error=invalid_client)
    const oauthError = params.get('error');
    const errorDescription = params.get('error_description');

    if (oauthError) {
      let title = 'Google Login Failed';
      let message = errorDescription || 'Google OAuth authentication was rejected.';
      if (oauthError === 'access_denied') {
        title = 'Access Denied';
        message = 'You cancelled the Google login or access was denied.';
      } else if (oauthError === 'invalid_client') {
        title = 'OAuth Configuration Error';
        message = 'Google OAuth credentials are not configured properly. Please contact support.';
      }
      setErrorInfo({ title, message });
      setTimeout(() => navigate('/auth/login', { replace: true }), 4000);
      return;
    }

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

  if (errorInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="luxury-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{errorInfo.title}</h2>
          <p className="text-muted-foreground text-sm mb-4">{errorInfo.message}</p>
          <p className="text-xs text-slate-400">Redirecting back to login in a moment...</p>
        </div>
      </div>
    );
  }

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
