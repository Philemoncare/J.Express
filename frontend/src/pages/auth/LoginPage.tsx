import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import { Loader2, ArrowRight, Shield, Command, KeyRound, Mail, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [step, setStep] = useState<'login' | 'otp' | 'forgot' | 'reset_otp' | 'reset_password'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isStrong, setIsStrong] = useState(true);

  React.useEffect(() => {
    const check = async () => {
      try {
        await api.get('health', { timeout: 2000 });
        setIsStrong(true);
      } catch (e) {
        setIsStrong(false);
      }
    };
    const interval = setInterval(check, 5000);
    check();
    return () => clearInterval(interval);
  }, []);

  const { login, verifyOtp, resendOtp, forgotPassword, resetPassword, isLoggingIn, isVerifying, isResending, isForgotting, isResetting } = useAuth();
  const { register, handleSubmit, reset, watch } = useForm();

  const codeValue = watch('code');

  // Auto-submit OTP when 6 digits are reached
  React.useEffect(() => {
    if (codeValue?.length === 6) {
      if (step === 'otp') {
        handleSubmit(onOtpSubmit)();
      } else if (step === 'reset_otp') {
        handleSubmit(onResetOtpSubmit)();
      }
    }
  }, [codeValue, step, handleSubmit]);

  React.useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = () => {
    if (resendTimer > 0 || isResending) return;
    resendOtp(userEmail, {
        onSuccess: () => setResendTimer(60)
    });
  };

  const triggerError = (message: string) => {
    setError(message);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const onLoginSubmit = async (data: any) => {
    setError(null);
    setUserEmail(data.email);
    login(data, {
      onSuccess: (res: any) => {
        if (!res.data?.isDirectLogin) {
          setStep('otp');
          reset({ code: '' });
        }
      },
      onError: (err: any) => {
        console.error('Login Error:', err);
        const apiBase = api.defaults.baseURL;
        const msg = err.response?.data?.message || (err.code === 'ERR_NETWORK' ? `Connection Failed: System Offline at ${apiBase}` : 'Invalid Credentials');
        triggerError(msg);
      }
    });
  };

  const onOtpSubmit = (data: any) => {
    setError(null);
    verifyOtp({ email: userEmail, code: data.code }, {
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Invalid Verification Code';
        triggerError(msg);
      }
    });
  };

  const onForgotSubmit = (data: any) => {
    setError(null);
    setUserEmail(data.email);
    forgotPassword(data.email, {
      onSuccess: () => {
        setStep('reset_otp');
        reset({ code: '' });
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'This email address is not registered in our system.';
        triggerError(msg);
      }
    });
  };

  const onResetOtpSubmit = (data: any) => {
    setResetCode(data.code);
    setStep('reset_password');
    reset({ newPassword: '', confirmPassword: '' });
  };

  const onResetPasswordSubmit = (data: any) => {
    setError(null);
    if (!resetCode) {
        triggerError('Verification code missing. Please restart the process.');
        return;
    }
    if (data.newPassword !== data.confirmPassword) {
        triggerError('Passwords do not match');
        return;
    }
    resetPassword({ email: userEmail, code: resetCode, newPassword: data.newPassword }, {
      onSuccess: (res: any) => {
        toast.success(res.message || 'Password reset successfully');
        setStep('login');
        reset({ email: userEmail, password: '' });
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Failed to reset password';
        triggerError(msg);
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] selection:bg-[#10b981]/30 font-sans p-6 overflow-hidden relative">

      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-emerald-50/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white to-transparent" />
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 h-40 bg-[#10b981]/5 rounded-t-[10rem] blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] sm:rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Panel - Illustration */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 items-center justify-center p-12 border-r border-slate-100">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center text-center"
                >
                    <img
                        src="/images/Person Using Tablet Next to a Car in 3D Style.jpg"
                        className="w-72 h-72 object-contain drop-shadow-2xl rounded-[3rem] mb-8"
                        alt="Welcome Illustration"
                    />
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Fleet Intelligence</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Next-Gen Operational Core</p>
                </motion.div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col items-center">
              {/* Mobile Header Only */}
              <div className="md:hidden mb-8 w-full flex flex-col items-center">
                <motion.img
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    src="/images/Person Using Tablet Next to a Car in 3D Style.jpg"
                    className="w-32 h-32 object-contain drop-shadow-2xl rounded-3xl mb-6"
                    alt="Welcome Illustration"
                />
              </div>

              <div className="flex flex-col items-center mb-8 sm:mb-12 text-center">
                  <h1 className="text-4xl sm:text-5xl font-black text-[#10b981] mb-2 tracking-tightest italic">Welcome !</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[#1e293b] tracking-tighter">
                        J.Express
                    </span>
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Command size={14} strokeWidth={3} />
                    </div>
                  </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 'login' && (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full"
                  >
                    <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6">
                      <motion.div
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        <div className="relative">
                            <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10b981] transition-colors" size={20} />
                            <input
                              {...register('email', { required: true })}
                              type="email"
                              required
                              className={clsx(
                                "w-full pl-16 pr-8 py-5 bg-[#f8fafc] border rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm",
                                error ? "border-red-400 bg-red-50/20" : "border-slate-100 focus:border-[#10b981]/50 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5"
                              )}
                              placeholder="EMAIL ADDRESS"
                            />
                        </div>
                        <div className="relative group">
                            <KeyRound className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10b981] transition-colors" size={20} />
                            <input
                              {...register('password', { required: true })}
                              type={showPassword ? "text" : "password"}
                              required
                              className={clsx(
                                "w-full pl-16 pr-14 py-5 bg-[#f8fafc] border rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm",
                                error ? "border-red-400 bg-red-50/20" : "border-slate-100 focus:border-[#10b981]/50 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5"
                              )}
                              placeholder="PASSWORD"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex justify-end px-2">
                            <button
                                type="button"
                                onClick={() => { setStep('forgot'); setError(null); reset({ email: '' }); }}
                                className="text-[11px] font-bold text-slate-400 hover:text-[#10b981] transition-colors uppercase tracking-wider"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] font-bold text-rose-500 text-center mt-2 px-4 leading-tight"
                          >
                            {error}
                          </motion.p>
                        )}
                      </motion.div>

                      <button
                        disabled={isLoggingIn}
                        className="w-full py-5 bg-gradient-to-br from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white text-[15px] font-black rounded-2xl transition-all shadow-[0_20px_50px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_20px_60px_-5px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 group active:scale-[0.97] mt-4 border-t border-white/20"
                      >
                        {isLoggingIn ? <Loader2 size={20} className="animate-spin" /> : <>LOGIN NOW <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" /></>}
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 'otp' && (
                  <motion.div
                    key="otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full text-center"
                  >
                    <div className="mb-8">
                      <p className="text-slate-500 text-sm font-medium">Identity Verification Required</p>
                      <p className="text-[11px] font-black text-[#10b981] uppercase tracking-widest mt-1">SENT TO {userEmail}</p>
                    </div>

                    <form onSubmit={handleSubmit(onOtpSubmit)} className="space-y-6">
                      <motion.div
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        <input
                            {...register('code', { required: true })}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]*"
                            required
                            maxLength={6}
                            autoFocus
                            className={clsx(
                                "w-full px-8 py-6 bg-[#f8fafc] border rounded-3xl text-3xl font-black text-center tracking-[0.5em] text-slate-800 focus:outline-none transition-all shadow-sm",
                                error ? "border-red-400 bg-red-50/20" : "border-slate-100 focus:border-[#10b981]/50 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5"
                            )}
                            placeholder="000000"
                        />

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] font-bold text-rose-500 text-center mt-2 px-4 leading-tight"
                          >
                            {error}
                          </motion.p>
                        )}
                      </motion.div>

                      <button
                        disabled={isVerifying}
                        className="w-full py-5 bg-gradient-to-br from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-white text-[14px] font-black rounded-2xl transition-all shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 group active:scale-[0.97] border-t border-white/10"
                      >
                        {isVerifying ? <Loader2 size={20} className="animate-spin" /> : <>VERIFY IDENTITY <Shield size={18} /></>}
                      </button>

                      <div className="flex flex-col items-center gap-4">
                        <button
                            type="button"
                            disabled={resendTimer > 0 || isResending}
                            onClick={handleResend}
                            className="text-[11px] font-bold text-slate-500 hover:text-[#10b981] disabled:opacity-50 disabled:hover:text-slate-500 transition-colors uppercase tracking-wider"
                        >
                            {isResending ? "Sending..." : resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Verification Code"}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep('login'); setError(null); }}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#10b981] transition-colors"
                        >
                            Return to Login
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === 'forgot' && (
                  <motion.div
                    key="forgot-form"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full text-center"
                  >
                    <div className="mb-8">
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recover Access</h2>
                      <p className="text-slate-500 text-xs font-medium mt-1 text-balance px-4">Enter your email and we'll send a secure reset code.</p>
                    </div>

                    <form onSubmit={handleSubmit(onForgotSubmit)} className="space-y-6">
                      <motion.div
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        <div className="relative group">
                            <Mail className={clsx(
                                "absolute left-7 top-1/2 -translate-y-1/2 transition-colors",
                                error ? "text-red-400" : "text-slate-300 group-focus-within:text-[#10b981]"
                            )} size={20} />
                            <input
                              {...register('email', { required: true })}
                              type="email"
                              required
                              className={clsx(
                                "w-full pl-16 pr-8 py-5 bg-[#f8fafc] border rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm",
                                error ? "border-red-400 bg-red-50/20" : "border-slate-100 focus:border-[#10b981]/50 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5"
                              )}
                              placeholder="EMAIL ADDRESS"
                            />
                            {isForgotting && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                    <Loader2 size={16} className="animate-spin text-[#10b981]" />
                                </div>
                            )}
                        </div>

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] font-bold text-rose-500 text-center mt-2 px-4 leading-tight"
                          >
                            {error}
                          </motion.p>
                        )}
                      </motion.div>

                      <button
                        disabled={isForgotting}
                        className="w-full py-5 bg-gradient-to-br from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white text-[14px] font-black rounded-2xl transition-all shadow-[0_20px_50px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 group active:scale-[0.97] border-t border-white/20"
                      >
                        {isForgotting ? "VERIFYING EMAIL..." : <>VERIFY & SEND CODE <ArrowRight size={18} /></>}
                      </button>

                      <button
                        type="button"
                        onClick={() => { setStep('login'); setError(null); }}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#10b981] transition-colors mt-2"
                      >
                        Back to Sign In
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === 'reset_otp' && (
                  <motion.div
                    key="reset-otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full text-center"
                  >
                    <div className="mb-8">
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Verify Code</h2>
                      <p className="text-slate-500 text-xs font-medium mt-1">Sent to <span className="text-[#10b981]">{userEmail}</span></p>
                    </div>

                    <form onSubmit={handleSubmit(onResetOtpSubmit)} className="space-y-6">
                      <motion.div
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        <input
                            {...register('code', { required: true })}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]*"
                            required
                            maxLength={6}
                            autoFocus
                            className={clsx(
                                "w-full px-8 py-6 bg-[#f8fafc] border rounded-3xl text-3xl font-black text-center tracking-[0.5em] text-slate-800 focus:outline-none transition-all shadow-sm",
                                error ? "border-red-400 bg-red-50/20" : "border-slate-100 focus:border-[#10b981]/50 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5"
                            )}
                            placeholder="000000"
                        />
                      </motion.div>

                      <button
                        className="w-full py-5 bg-gradient-to-br from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white text-[14px] font-black rounded-2xl transition-all shadow-[0_20px_50px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 group active:scale-[0.97] border-t border-white/20"
                      >
                        CONTINUE <ArrowRight size={18} />
                      </button>

                      <div className="flex flex-col items-center gap-4">
                        <button
                            type="button"
                            disabled={resendTimer > 0 || isResending}
                            onClick={handleResend}
                            className="text-[11px] font-bold text-slate-500 hover:text-[#10b981] disabled:opacity-50 disabled:hover:text-slate-500 transition-colors uppercase tracking-wider"
                        >
                            {isResending ? "Sending..." : resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Verification Code"}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep('forgot'); setError(null); }}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#10b981] transition-colors"
                        >
                            Request New Code
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === 'reset_password' && (
                  <motion.div
                    key="reset-password-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full text-center"
                  >
                    <div className="mb-8">
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Password</h2>
                      <p className="text-slate-500 text-xs font-medium mt-1 text-balance px-4">Set a strong password that you haven't used recently.</p>
                    </div>

                    <form onSubmit={handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                      <motion.div
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className="space-y-3"
                      >
                        <div className="relative group">
                            <KeyRound className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10b981] transition-colors" size={20} />
                            <input
                              {...register('newPassword', { required: true, minLength: 8 })}
                              type={showPassword ? "text" : "password"}
                              required
                              autoFocus
                              className={clsx(
                                "w-full pl-16 pr-14 py-5 bg-[#f8fafc] border rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm",
                                error ? "border-red-400 bg-red-50/20" : "border-slate-100 focus:border-[#10b981]/50 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5"
                              )}
                              placeholder="NEW PASSWORD"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative group">
                            <KeyRound className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10b981] transition-colors" size={20} />
                            <input
                              {...register('confirmPassword', { required: true })}
                              type={showPassword ? "text" : "password"}
                              required
                              className={clsx(
                                "w-full pl-16 pr-8 py-5 bg-[#f8fafc] border rounded-2xl text-[15px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm",
                                error ? "border-red-400 bg-red-50/20" : "border-slate-100 focus:border-[#10b981]/50 focus:bg-white focus:ring-4 focus:ring-[#10b981]/5"
                              )}
                              placeholder="CONFIRM NEW PASSWORD"
                            />
                        </div>

                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] font-bold text-rose-500 text-center mt-2 px-4 leading-tight"
                          >
                            {error}
                          </motion.p>
                        )}
                      </motion.div>

                      <button
                        disabled={isResetting}
                        className="w-full py-5 bg-gradient-to-br from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white text-[14px] font-black rounded-2xl transition-all shadow-[0_20px_50px_-10px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 group active:scale-[0.97] border-t border-white/20"
                      >
                        {isResetting ? <Loader2 size={20} className="animate-spin" /> : <>UPDATE PASSWORD <Shield size={18} /></>}
                      </button>

                      <button
                        type="button"
                        onClick={() => { setStep('reset_otp'); setError(null); }}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#10b981] transition-colors mt-2"
                      >
                        Change Code
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer Indicators */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-40 hover:opacity-100 transition-all">
          <div className="flex items-center gap-2 text-slate-400">
             <Shield size={14} className={clsx(isStrong ? "text-emerald-500" : "text-rose-500")} />
             <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                {isStrong ? "PERSISTENT CHANNEL" : "SIGNAL DROPPED"}
             </span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-2 text-slate-400">
            <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", isStrong ? "bg-[#10b981]" : "bg-rose-500")} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">CORE ENGINES UP</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
