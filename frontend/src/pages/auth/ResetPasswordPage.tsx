import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import { Lock, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      email: searchParams.get('email') || '',
      token: searchParams.get('token') || '',
      password: '',
      password_confirmation: '',
    }
  });

  const password = watch('password');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await api.post('/reset-password', data);
      toast.success('Key updated successfully');
      navigate('/login');
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
            <div className="w-10 h-10 bg-blue-600 rounded mx-auto mb-4 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-600/20">JE</div>
            <h1 className="text-xs font-black text-white uppercase tracking-[0.3em] italic mb-1">Overwrite Secret</h1>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Protocol Override</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
            <input type="hidden" {...register('token')} />
            <input type="hidden" {...register('email')} />

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">New Secret Key</label>
              <div className="relative">
                <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  {...register('password', { required: true, minLength: 8 })}
                  type="password"
                  className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/10 rounded text-[11px] text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Confirm New Secret</label>
              <div className="relative">
                <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  {...register('password_confirmation', {
                    validate: value => value === password || 'Mismatch'
                  })}
                  type="password"
                  className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/10 rounded text-[11px] text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-600/10 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Overwrite'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
