import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car, ArrowRight, CheckCircle, Shield, Loader2 } from 'lucide-react';
import logoImage from '@/image/logo.png';
import { useAuthStore } from '@/store';
import { authService } from '@/services/authService';
import { useToast } from '@/components/ui/Toast';
import { isStrongPassword } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';
import { useT } from '@/i18n/translations';
import type { User } from '@/types';

declare global {
  interface Window {
    google?: any;
  }
}

// Redirect logged-in/registering users to Homepage to show logged-in state
const getRoleBasedDashboard = (user: User | null): string => {
  return '/';
};


// ====== GOOGLE LOGIN REAL BUTTON ======
const GoogleLoginButton: React.FC<{ onSuccess?: () => void }> = () => {
  const t = useT();
  const toast = useToast();

  // Detect if Google OAuth is configured (not using placeholder values)
  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  const isGoogleConfigured = googleClientId && 
    googleClientId !== 'dev-client-id' && 
    googleClientId !== '' && 
    !googleClientId.startsWith('dev-');

  const handleGoogleLogin = () => {
    if (!isGoogleConfigured) {
      toast.error(
        'Google Login Not Configured',
        'Please use email/password login. Contact admin to set up Google OAuth.'
      );
      return;
    }
    // Redirect directly to the Spring Security OAuth2 authorization endpoint
    const backendUrl = (import.meta as any).env?.VITE_API_URL 
      ? (import.meta as any).env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-2">
      <button
        type="button"
        onClick={handleGoogleLogin}
        title={!isGoogleConfigured ? 'Google OAuth not configured — use email/password instead' : 'Continue with Google'}
        className={`w-full max-w-[320px] flex items-center justify-center gap-3 px-4 py-3 border rounded-full transition-all duration-200 shadow-sm font-semibold text-sm ${
          isGoogleConfigured
            ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-foreground bg-background'
            : 'border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed text-muted-foreground bg-background'
        }`}
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill={isGoogleConfigured ? '#4285F4' : '#9CA3AF'}
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill={isGoogleConfigured ? '#34A853' : '#9CA3AF'}
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill={isGoogleConfigured ? '#FBBC05' : '#9CA3AF'}
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill={isGoogleConfigured ? '#EA4335' : '#9CA3AF'}
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isGoogleConfigured ? 'Continue with Google' : 'Google Login (Not Configured)'}
      </button>
      {!isGoogleConfigured && (
        <p className="text-xs text-muted-foreground mt-1.5 text-center max-w-[320px]">
          Use email/password login below
        </p>
      )}
    </div>
  );
};

// ====== LOGIN PAGE ======
export const LoginPage: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, user, isInitialized } = useAuthStore();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    // BUG-18 FIX: Already-authenticated users get sent to their role dashboard, not '/'
    if (isInitialized && isAuthenticated && user) {
      navigate(getRoleBasedDashboard(user), { replace: true });
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  if (!isInitialized) {
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await login(email, password);
    if (success) {
      const { user } = useAuthStore.getState();
      toast.success(t.auth.welcomeBack, t.auth.signInSuccess);
      // BUG-1/16 FIX: Navigate to role-based dashboard, not '/'
      navigate(getRoleBasedDashboard(user), { replace: true });
    } else {
      toast.error(t.auth.invalidCredentials, t.auth.invalidCredentialsDesc);
      setErrors({ password: t.auth.invalidCredentialsDesc });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Vehicle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/90 to-[#0F172A]/40" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 logo-wrapper">
            <img src={logoImage} alt="LuxeWay" className="logo-effect h-12 md:h-14 w-auto object-contain brightness-0 invert" />
          </Link>

          <div>
            <h2 className="font-display text-5xl font-bold text-white mb-4 leading-tight">
              {t.hero.title1}<br />{t.hero.title2}.
            </h2>
            <p className="text-white/70 text-lg mb-8">{t.hero.subtitle}</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: Shield, text: t.marketplace.verifiedBadge },
                { icon: CheckCircle, text: t.booking.insurance },
                { icon: Car, text: `10,000+ ${t.marketplace.featured}` },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 text-white/80 text-sm">
                  <item.icon className="w-5 h-5 text-gold" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden logo-wrapper">
            <img src={logoImage} alt="LuxeWay" className="logo-effect h-10 w-auto object-contain" />
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">{t.auth.welcome}</h1>
          <p className="text-muted-foreground mb-8">{t.auth.signInSubtitle}</p>

          {/* Google Login */}
          <GoogleLoginButton onSuccess={() => navigate('/')} />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">{t.auth.orWith}</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`lux-input ${errors.email ? 'error' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">{t.auth.password}</label>
                <Link to="/auth/forgot-password" className="text-xs text-accent hover:text-blue-700 transition-colors">
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`lux-input pr-12 ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-70"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> ...</>
              ) : (
                <>{t.auth.login} <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.noAccount}{' '}
            <Link to="/auth/register" className="font-semibold text-accent hover:text-blue-700 transition-colors">
              {t.auth.register}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ====== REGISTER PAGE ======
export const RegisterPage: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated, user, isInitialized } = useAuthStore();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    // BUG-18 FIX: Already-authenticated users get sent to their role dashboard, not '/'
    if (isInitialized && isAuthenticated && user) {
      navigate(getRoleBasedDashboard(user), { replace: true });
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  if (!isInitialized) {
    return null;
  }

  const passwordStrength = isStrongPassword(form.password);

  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-success'];
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  const update = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!passwordStrength.valid) e.password = t.auth.weakPassword;
    if (form.password !== form.confirmPassword) e.confirmPassword = t.auth.passwordMismatch;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { if (validateStep1()) setStep(2); return; }
    if (!validateStep2()) return;

    const success = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: form.role as any,
    });

    if (success) {
      const { user } = useAuthStore.getState();
      toast.success('Account created!', 'Welcome to LuxeWay.');
      // BUG-16 FIX: Navigate to role-based dashboard, not '/'
      navigate(getRoleBasedDashboard(user), { replace: true });
    } else {
      toast.error('Email already exists', 'Try signing in instead.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2070&auto=format&fit=crop" alt="Ferrari" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/90 to-[#0F172A]/30" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 logo-wrapper">
            <img src={logoImage} alt="LuxeWay" className="logo-effect h-12 md:h-14 w-auto object-contain brightness-0 invert" />
          </Link>
          <div>
            <h2 className="font-display text-5xl font-bold text-white mb-4">{t.auth.register}.</h2>
            <p className="text-white/70 text-lg">{t.auth.signUpSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden logo-wrapper">
            <img src={logoImage} alt="LuxeWay" className="logo-effect h-10 w-auto object-contain" />
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 transition-all duration-500 ${step > s ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
              </React.Fragment>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            {step === 1 ? t.auth.register : t.auth.confirmPassword}
          </h1>
          <p className="text-muted-foreground mb-8">
            {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 ? (
              <>
                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'customer', label: t.marketplace.bookNow, icon: Car },
                      { value: 'owner', label: t.nav.addVehicle, icon: Shield },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update('role', opt.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${form.role === opt.value ? 'border-accent bg-blue-50 dark:bg-blue-900/30 text-accent' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                      >
                        <opt.icon className="w-4 h-4" /> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.firstName}</label>
                    <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="James" className={`lux-input ${errors.firstName ? 'error' : ''}`} />
                    {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.lastName}</label>
                    <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Smith" className={`lux-input ${errors.lastName ? 'error' : ''}`} />
                    {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.email}</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="james@example.com" className={`lux-input ${errors.email ? 'error' : ''}`} />
                  {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.phone}</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+84 ..." className={`lux-input ${errors.phone ? 'error' : ''}`} />
                  {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
                </div>

                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="btn-primary w-full py-3.5 text-base">
                  {t.booking.continue} <ArrowRight className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.password}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 8 characters" className={`lux-input pr-12 ${errors.password ? 'error' : ''}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.strength ? strengthColors[passwordStrength.strength] : 'bg-slate-200 dark:bg-slate-800'}`} />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.valid ? 'text-success' : 'text-slate-400'}`}>{strengthLabels[passwordStrength.strength]}</p>
                    </div>
                  )}
                  {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.confirmPassword}</label>
                  <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat password" className={`lux-input ${errors.confirmPassword ? 'error' : ''}`} />
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <input type="checkbox" id="terms" className="mt-0.5 rounded" required />
                  <label htmlFor="terms" className="text-xs text-muted-foreground">
                    {t.auth.agreeTerms}
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl text-foreground">
                    {t.booking.back}
                  </button>
                  <motion.button type="submit" disabled={isLoading} whileHover={{ scale: isLoading ? 1 : 1.01 }} whileTap={{ scale: 0.99 }} className="btn-primary flex-1 py-3.5 text-base disabled:opacity-70">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> ...</> : <>{t.auth.register} <ArrowRight className="w-5 h-5" /></>}
                  </motion.button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.hasAccount}{' '}
            <Link to="/auth/login" className="font-semibold text-accent hover:text-blue-700 transition-colors">{t.auth.login}</Link>
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or</span></div>
          </div>
          <GoogleLoginButton onSuccess={() => navigate('/')} />
        </motion.div>
      </div>
    </div>
  );
};

// ====== FORGOT PASSWORD PAGE ======
export const ForgotPasswordPage: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await authService.sendOTP(email);
      if (success) {
        setSent(true);
        toast.success(t.auth.checkEmail, 'An OTP verification code has been dispatched.');
      }
    } catch (err: any) {
      toast.error('Verification Error', err.message || 'This email address is not registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center logo-wrapper">
          <img src={logoImage} alt="LuxeWay" className="logo-effect h-12 w-auto object-contain" />
        </Link>

        <div className="luxury-card p-8">
          {!sent ? (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t.auth.forgotPasswordTitle}</h1>
              <p className="text-muted-foreground text-sm mb-6">{t.auth.forgotPasswordSubtitle}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t.auth.email}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="lux-input" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-70">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> ...</> : t.auth.sendReset}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">{t.auth.checkEmail}</h2>
              <p className="text-muted-foreground text-sm mb-6">{t.auth.checkEmailDesc} <strong>{email}</strong>.</p>
              <p className="text-xs text-slate-400 mb-4">Check your email for the 6-digit confirmation code.</p>
              <Link to={`/auth/otp?email=${encodeURIComponent(email)}`} className="btn-primary w-full py-3 justify-center">Enter OTP →</Link>
            </motion.div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/auth/login" className="font-semibold text-accent">← {t.auth.backToLogin}</Link>
        </p>
      </motion.div>
    </div>
  );
};
