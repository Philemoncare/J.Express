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
          'flex items-center px-2 py-1.5 rounded-md transition-all duration-200 group',
          isActive
            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/10'
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
        )}
      >
        <item.icon className={clsx('mr-2.5 h-3.5 w-3.5 shrink-0', isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300')} />
        <span className="text-[11px] font-bold uppercase tracking-tight">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#020617] text-slate-400 overflow-hidden antialiased select-none font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-44 border-r border-white/5 bg-[#0b0f1a] flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded flex items-center justify-center text-[10px] font-black text-white mr-2 shadow-lg shadow-emerald-600/20">JE</div>
          <span className="text-xs font-black text-white uppercase tracking-tighter italic">J.Express</span>
        </div>

        <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Navigation</p>
          {navigation.map((item) => <NavItem key={item.name} item={item} />)}
        </div>

        <div className="p-2 border-t border-white/5 bg-black/10">
          <Link to="/settings" className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer group">
            <Avatar
                src={user?.profileImage}
                name={user?.name}
                size="xs"
                className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-200 truncate leading-none">
                {user?.name ? user.name.split(' ')[0] : 'Admin'}
              </p>
              <p className="text-[8px] text-slate-600 font-bold truncate mt-0.5 uppercase tracking-tighter italic">Admin User</p>
            </div>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full mt-1 flex items-center justify-center px-2 py-1.5 text-[9px] font-black text-slate-600 hover:text-rose-400 hover:bg-rose-400/5 rounded-md transition-all uppercase tracking-widest border border-transparent hover:border-rose-400/10"
          >
            <LogOut size={10} className="mr-1.5" /> Sign Out
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
