import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import { Mail, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await api.post('/forgot-password', data);
      setIsSent(true);
      toast.success('Reset link sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-[#0b0f1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center border-b border-white/5 bg-white/[0.01]">
            <Link to="/login" className="inline-flex items-center text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors mb-4">
              <ChevronLeft size={12} className="mr-1" /> Back to Access
            </Link>
            <h1 className="text-xs font-black text-white uppercase tracking-[0.3em] italic mb-1">Key Recovery</h1>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Initialization Protocol</p>
          </div>

          <div className="p-8">
            {!isSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Identity Vector</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      {...register('email', { required: true })}
                      type="email"
                      className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/10 rounded text-[11px] text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-600/10 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Request Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
                  <CheckCircle size={20} />
                </div>
                <h2 className="text-[11px] font-black text-white uppercase mb-2 tracking-widest">Signal Transmitted</h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-6">Check your encrypted feed for instructions.</p>
                <button
                  onClick={() => setIsSent(false)}
                  className="text-[9px] text-blue-500 hover:text-blue-400 font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Retransmit Signal
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
