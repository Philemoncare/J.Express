import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const EmailVerificationPage = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const url = searchParams.get('url');
      if (!url) {
        setStatus('error');
        return;
      }

      try {
        await api.get(url);
        setStatus('success');
        toast.success('Identity confirmed');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#0b0f1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="px-8 pt-8 pb-6 text-center border-b border-white/5 bg-white/[0.01]">
          <div className="w-10 h-10 bg-blue-600 rounded mx-auto mb-4 flex items-center justify-center text-white font-black text-xs">JE</div>
          <h1 className="text-xs font-black text-white uppercase tracking-[0.3em] italic mb-1">Identity Audit</h1>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Verification Protocol</p>
        </div>

        <div className="p-12 text-center">
          {status === 'loading' && (
            <>
              <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-6" />
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Auditing Link...</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={24} />
              </div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">Audit Passed</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-8">Access granted. Shifting to Command Center...</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[9px] text-blue-500 hover:text-blue-400 font-black uppercase tracking-[0.2em] transition-colors"
              >
                Manual Override
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">Audit Failed</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-8">Verification link corrupted or expired.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all"
              >
                Return to Access Terminal
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
