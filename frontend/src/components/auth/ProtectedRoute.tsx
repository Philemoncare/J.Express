import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { setLoading } from '@/store/slices/authSlice';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state: any) => state.auth);

  if (isLoading && !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617] select-none font-sans p-6 text-center">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
        >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)] border border-white/20">
                <span className="text-xl font-black italic tracking-tighter">JE</span>
            </div>
            {/* Pulsing ring */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl -z-10"
            />
        </motion.div>

        <div className="mt-12 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="animate-spin text-emerald-500 h-3.5 w-3.5" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic ml-1">
                Synchronizing Secure Session
            </p>
          </div>

          <div className="w-48 h-[3px] bg-white/5 rounded-full overflow-hidden relative">
             <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
             />
          </div>
          <p className="mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest animate-pulse">
            System Core v1.1.0
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
