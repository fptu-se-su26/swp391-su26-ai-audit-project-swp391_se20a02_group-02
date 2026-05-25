import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Car, ArrowRight, CheckCircle, Shield, Loader2 } from 'lucide-react';
import logoImage from '@/image/logo.png';
import { useAuthStore } from '@/store';
import { useToast } from '@/components/ui/Toast';
import { isStrongPassword } from '@/utils';
import { fadeUp, staggerContainer, staggerItem } from '@/animations/variants';

// ====== LOGIN PAGE ======
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      toast.success('Welcome back!', 'You have been signed in successfully.');
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'owner') navigate('/owner');
      else navigate('/dashboard');
    } else {
      toast.error('Invalid credentials', 'Please check your email and password.');
      setErrors({ password: 'Invalid email or password' });
    }
  };



  return (
    <div className="min-h-screen flex">
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
              Drive the<br />Extraordinary.
            </h2>
            <p className="text-white/70 text-lg mb-8">Access the world's most exclusive fleet of luxury vehicles.</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: Shield, text: 'Identity verified renters only' },
                { icon: CheckCircle, text: '$5M insurance on every rental' },
                { icon: Car, text: '10,000+ premium vehicles globally' },
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
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F8FAFC]">
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

          <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your LuxeWay account</p>



          {/* Google Login */}
          <GoogleLoginButton onSuccess={() => navigate('/dashboard')} />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F8FAFC] px-3 text-xs text-slate-400">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address</label>
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
                <label className="text-sm font-medium text-[#0F172A]">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-accent hover:text-blue-700 transition-colors">
                  Forgot password?
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
                <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-semibold text-accent hover:text-blue-700 transition-colors">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ====== GOOGLE LOGIN MOCK BUTTON ======
const GoogleLoginButton: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { login } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Simulate Google OAuth redirect + token exchange (1.5s)
    await new Promise(r => setTimeout(r, 1500));
    // Auto-login as a customer demo account
    const success = await login('user@luxeway.com', 'User@123');
    setLoading(false);
    if (success) {
      toast.success('Signed in with Google!', 'Welcome back.');
      onSuccess();
    } else {
      toast.error('Google login failed', 'Please try again.');
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-semibold text-slate-700 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-60"
    >
      {loading ? (
        <><Loader2 className="w-5 h-5 animate-spin text-accent" /> Connecting to Google...</>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </>
      )}
    </motion.button>
  );
};

// ====== REGISTER PAGE ======
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!passwordStrength.valid) e.password = 'Password too weak';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
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
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'owner') navigate('/owner');
      else navigate('/dashboard');
    } else {
      toast.error('Email already exists', 'Try signing in instead.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2070&auto=format&fit=crop" alt="Ferrari" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/90 to-[#0F172A]/30" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 logo-wrapper">
            <img src={logoImage} alt="LuxeWay" className="logo-effect h-12 md:h-14 w-auto object-contain brightness-0 invert" />
          </Link>
          <div>
            <h2 className="font-display text-5xl font-bold text-white mb-4">Join the<br />Elite Fleet.</h2>
            <p className="text-white/70 text-lg">Create your account and start your luxury journey today.</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#F8FAFC]">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden logo-wrapper">
            <img src={logoImage} alt="LuxeWay" className="logo-effect h-10 w-auto object-contain" />
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-[#0F172A] text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 transition-all duration-500 ${step > s ? 'bg-[#0F172A]' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-1">
            {step === 1 ? 'Create Account' : 'Set Password'}
          </h1>
          <p className="text-slate-500 mb-8">
            {step === 1 ? 'Step 1 of 2 — Personal information' : 'Step 2 of 2 — Secure your account'}
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 ? (
              <>
                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">I want to</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'customer', label: 'Rent Vehicles', icon: Car },
                      { value: 'owner', label: 'List My Car', icon: Shield },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update('role', opt.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${form.role === opt.value ? 'border-accent bg-blue-50 text-accent' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        <opt.icon className="w-4 h-4" /> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">First Name</label>
                    <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="James" className={`lux-input ${errors.firstName ? 'error' : ''}`} />
                    {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Last Name</label>
                    <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Smith" className={`lux-input ${errors.lastName ? 'error' : ''}`} />
                    {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="james@example.com" className={`lux-input ${errors.email ? 'error' : ''}`} />
                  {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" className={`lux-input ${errors.phone ? 'error' : ''}`} />
                  {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
                </div>

                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="btn-primary w-full py-3.5 text-base">
                  Continue <ArrowRight className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Password</label>
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
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.strength ? strengthColors[passwordStrength.strength] : 'bg-slate-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.valid ? 'text-success' : 'text-slate-400'}`}>{strengthLabels[passwordStrength.strength]}</p>
                    </div>
                  )}
                  {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Confirm Password</label>
                  <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat password" className={`lux-input ${errors.confirmPassword ? 'error' : ''}`} />
                  {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
                  <input type="checkbox" id="terms" className="mt-0.5 rounded" required />
                  <label htmlFor="terms" className="text-xs text-slate-500">
                    I agree to LuxeWay's <a href="#" className="text-accent underline">Terms of Service</a> and <a href="#" className="text-accent underline">Privacy Policy</a>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost border border-slate-200 px-4 py-3.5 rounded-2xl">
                    Back
                  </button>
                  <motion.button type="submit" disabled={isLoading} whileHover={{ scale: isLoading ? 1 : 1.01 }} whileTap={{ scale: 0.99 }} className="btn-primary flex-1 py-3.5 text-base disabled:opacity-70">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
                  </motion.button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-accent hover:text-blue-700 transition-colors">Sign in</Link>
          </p>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-[#F8FAFC] px-3 text-xs text-slate-400">or</span></div>
          </div>
          <GoogleLoginButton onSuccess={() => navigate('/dashboard')} />
        </motion.div>
      </div>
    </div>
  );
};

// ====== FORGOT PASSWORD PAGE ======
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center logo-wrapper">
          <img src={logoImage} alt="LuxeWay" className="logo-effect h-12 w-auto object-contain" />
        </Link>

        <div className="luxury-card p-8">
          {!sent ? (
            <>
              <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-2">Reset Password</h1>
              <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="lux-input" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-70">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display text-xl font-bold text-[#0F172A] mb-2">Check Your Email</h2>
              <p className="text-slate-500 text-sm mb-6">We've sent a reset link to <strong>{email}</strong>. Check your inbox and click the link.</p>
              <p className="text-xs text-slate-400 mb-4">Tip: The mock OTP is <strong>123456</strong></p>
              <Link to="/auth/otp" className="btn-primary w-full py-3 justify-center">Enter OTP →</Link>
            </motion.div>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/auth/login" className="font-semibold text-accent">← Back to Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};
