import { useAuthStore } from '@/store';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser,
    refreshUser,
    clearError,
  } = useAuthStore();

  const role = user?.role?.toLowerCase() || '';
  
  // Custom badges/role logic based on database role strings
  const isCustomer = role === 'customer';
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin' || role === 'super_admin';

  return {
    user,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    role,
    isCustomer,
    isOwner,
    isAdmin,
    login,
    logout,
    register,
    updateUser,
    refreshUser,
    clearError,
  };
};

export default useAuth;
