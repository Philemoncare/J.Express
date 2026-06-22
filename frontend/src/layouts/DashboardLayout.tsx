import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Car,
  TrendingUp,
  TrendingDown,
  Fuel,
  BarChart3,
  Shield,
  Settings,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import Avatar from '@/components/ui/Avatar';
import PageTransition from '@/components/ui/PageTransition';
import TopNavbar from '@/components/navigation/TopNavbar';
import BottomNavbar from '@/components/navigation/BottomNavbar';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Income', href: '/income', icon: TrendingUp },
    { name: 'Expenses', href: '/expenses', icon: TrendingDown },
    { name: 'Fuel', href: '/fuel', icon: Fuel },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Security', href: '/security', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const NavItem = ({ item }: any) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={clsx(
          'flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group mb-1',
          isActive
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
        )}
      >
        <item.icon className={clsx('mr-3.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110', isActive ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-slate-600 group-hover:text-slate-300')} />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] italic">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#020617] text-slate-400 overflow-hidden antialiased select-none font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-52 border-r border-white/5 bg-[#0b0f1a] flex-col shrink-0">
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-xl shadow-emerald-600/20 border border-emerald-400/20">JE</div>
             <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-tighter italic leading-none">J.Express</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Operational Core</span>
             </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[9px] font-black text-slate-700 uppercase tracking-[0.25em] mb-4">Tactical Matrix</p>
          {navigation.map((item) => <NavItem key={item.name} item={item} />)}
        </div>

        <div className="p-4 m-4 rounded-[2rem] bg-white/[0.02] border border-white/5">
          <Link to="/settings" className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
            <Avatar
                src={user?.profileImage}
                name={user?.name}
                size="sm"
                className="shrink-0 ring-2 ring-emerald-500/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-slate-200 truncate leading-none uppercase">
                {user?.name ? user.name.split(' ')[0] : 'Admin'}
              </p>
              <p className="text-[8px] text-slate-600 font-bold truncate mt-1.5 uppercase tracking-tighter italic">Verified Admin</p>
            </div>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full mt-4 flex items-center justify-center px-4 py-2.5 text-[10px] font-black text-rose-500/60 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all uppercase tracking-widest border border-rose-500/10 active:scale-95"
          >
            <LogOut size={12} className="mr-2" /> End Session
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <TopNavbar />

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#020617] pb-24 lg:pb-0">
         <div className="p-4 sm:p-5 lg:p-6 max-w-[1440px] mx-auto min-h-full flex flex-col">
            <Outlet />
         </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default DashboardLayout;
