import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Mail, User, Building2, Send, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const RequestAccessPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestAccess, isRequesting } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
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
    requestAccess(data, {
      onSuccess: () => {
        setIsSubmitted(true);
      }
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] overflow-hidden font-sans relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[45%] h-[45%] bg-indigo-600/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-[400px] px-4 text-center"
        >
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Request Received</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Thank you for your interest. We've sent a verification prompt to our admin team and a confirmation to your email.
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-blue-500 font-bold text-sm hover:underline"
            >
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] overflow-hidden font-sans relative">

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ x: glowX, y: glowY, translateX: '-50%', translateY: '-50%' }}
          className="absolute w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] z-0"
        />
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[45%] h-[45%] bg-indigo-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl overflow-hidden">

          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/20 mb-4">
              JE
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Request Access</h1>
            <p className="text-slate-500 text-xs mt-1 font-medium text-center">
              Tell us a bit about yourself to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative group">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('name', { required: "Name is required" })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/30 transition-all"
                  placeholder="Full Name"
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-500 font-medium ml-1">{(errors.name as any).message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('email', { required: "Work email is required" })}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/30 transition-all"
                  placeholder="Work Email"
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-500 font-medium ml-1">{(errors.email as any).message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('company', { required: "Company name is required" })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/30 transition-all"
                  placeholder="Company Name"
                />
              </div>
              {errors.company && <p className="text-[10px] text-rose-500 font-medium ml-1">{(errors.company as any).message}</p>}
            </div>

            <div className="space-y-1.5">
               <textarea
                  {...register('message')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/30 transition-all resize-none"
                  placeholder="Anything else you'd like to share?"
                />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isRequesting}
              type="submit"
              className="w-full flex items-center justify-center py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/10 transition-all disabled:opacity-50 group"
            >
              {isRequesting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <div className="flex items-center">
                  Submit Request
                  <Send size={16} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium hover:text-white transition-colors">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RequestAccessPage;
