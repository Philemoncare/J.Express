import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import { Link } from 'react-router-dom';
import NotificationCenter from '../notification/NotificationCenter';

const TopNavbar = () => {
  const { user } = useAuth();

  return (
    <header className="lg:hidden h-16 flex items-center justify-between px-6 sticky top-0 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-[12px] font-black text-white shadow-lg shadow-emerald-600/20">
          JE
        </div>
        <div>
          <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">J.Express</h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationCenter />
        <Link to="/settings">
          <Avatar
            src={user?.profileImage}
            name={user?.name}
            size="sm"
            className="ring-2 ring-white/5 ring-offset-2 ring-offset-[#020617]"
          />
        </Link>
      </div>
    </header>
  );
};

export default TopNavbar;
