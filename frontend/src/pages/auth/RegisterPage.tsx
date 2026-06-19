import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register: registerUser, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  // Mouse interaction for ambient glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const onSubmit = (data: any) => {
    registerUser(data);
  };

  const password = watch('password');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] overflow-hidden font-sans relative">

      {/* --- Animated Background System --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Mouse Follow Glow */}
        <motion.div
          style={{
            x: glowX,
            y: glowY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] z-0 opacity-60"
        />

        {/* Floating Gradient Blobs */}
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px]"
        />

        {/* Subtle Texture Layer */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* --- Main Container --- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[460px] px-6"
      >
        <div className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/[0.03] pointer-events-none group-hover:border-blue-500/20 transition-colors duration-1000" />

          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-600/30 mb-6"
            >
              JE
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl font-bold text-white tracking-tight"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-slate-400 text-sm mt-2 font-medium"
            >
              Get started with J.Express today.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-2"
            >
              <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-500" />
                <input
                  {...register('name', { required: "Full name is required" })}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-[1.25rem] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all duration-500"
                  placeholder="Full name"
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-3">{(errors.name as any).message}</p>}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="space-y-2"
            >
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-500" />
                <input
                  {...register('email', { required: "Email is required" })}
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-[1.25rem] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all duration-500"
                  placeholder="Email address"
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-3">{(errors.email as any).message}</p>}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="space-y-2"
            >
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-500" />
                <input
                  {...register('password', { required: "Password is required" })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-4 bg-white/[0.03] border border-white/10 rounded-[1.25rem] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all duration-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider ml-3">{(errors.password as any).message}</p>}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              whileHover={{ scale: 1.01, backgroundColor: '#3b82f6' }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoggingIn}
              type="submit"
              className="w-full flex items-center justify-center py-4 bg-blue-600 text-white text-sm font-bold rounded-[1.25rem] shadow-xl shadow-blue-600/20 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoggingIn ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <div className="flex items-center">
                  Create Account
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-10 text-center"
          >
            <p className="text-slate-500 text-xs font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-500 font-bold ml-1 hover:text-blue-400 transition-colors">Sign In</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
