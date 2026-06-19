import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingDown, Fuel, User, Plus, MoreHorizontal, BarChart3, Shield, Car, Settings, LogOut, TrendingUp, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '../ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: TrendingDown },
    { name: 'Add', href: '#', icon: Plus, isAction: true },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Menu', href: '#', icon: MoreHorizontal, isMenu: true },
  ];

  const extraItems = [
    { name: 'Inventory', href: '/vehicles', icon: Car },
    { name: 'Fuel Logs', href: '/fuel', icon: Fuel },
    { name: 'Security', href: '/security', icon: Shield },
    { name: 'Profile', href: '/settings', icon: Settings },
  ];

  const quickActions = [
    { name: 'Income', icon: TrendingUp, color: 'bg-emerald-500', path: '/income', action: 'openModal' },
    { name: 'Expense', icon: TrendingDown, color: 'bg-rose-500', path: '/expenses', action: 'openModal' },
    { name: 'Fuel', icon: Fuel, color: 'bg-orange-500', path: '/fuel', action: 'openModal' },
    { name: 'Vehicle', icon: Car, color: 'bg-blue-500', path: '/vehicles', action: 'openModal' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
        if (addRef.current && !addRef.current.contains(event.target as Node)) {
            setIsAddOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAddOpen(false);
  }, [location.pathname]);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0b0f1a]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-2 pb-8 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;

          if (item.isAction) {
            return (
              <button
                key={item.name}
                onClick={() => { setIsAddOpen(!isAddOpen); setIsMenuOpen(false); }}
                className="flex flex-col items-center justify-center -mt-12 group relative"
              >
                <motion.div
                    animate={{ rotate: isAddOpen ? 45 : 0 }}
                    className={clsx(
                        "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-[#020617] transition-all",
                        isAddOpen ? "bg-slate-800 shadow-slate-900/50" : "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-600/40"
                    )}
                >
                  {isAddOpen ? <X size={28} /> : <Plus size={28} />}
                </motion.div>
                <span className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest italic">
                  {item.name}
                </span>
              </button>
            );
          }

          if (item.isMenu) {
            return (
                <button
                    key={item.name}
                    onClick={() => { setIsMenuOpen(!isMenuOpen); setIsAddOpen(false); }}
                    className={clsx(
                        "flex flex-col items-center justify-center transition-all duration-200",
                        isMenuOpen ? "text-emerald-500" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <item.icon size={22} className={clsx(isMenuOpen && "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
                    <span className={clsx(
                        "text-[10px] font-black mt-1 uppercase tracking-tighter italic",
                        isMenuOpen ? "text-emerald-400" : "text-slate-500"
                    )}>
                        {item.name}
                    </span>
                </button>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                "flex flex-col items-center justify-center transition-all duration-200",
                isActive ? "text-emerald-500" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <item.icon size={22} className={clsx(isActive && "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
              <span className={clsx(
                "text-[10px] font-black mt-1 uppercase tracking-tighter italic",
                isActive ? "text-emerald-400" : "text-slate-500"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Modern Quick Action Popup */}
      <AnimatePresence>
        {isAddOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    onClick={() => setIsAddOpen(false)}
                />
                <motion.div
                    ref={addRef}
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    className="absolute bottom-full left-4 right-4 mb-10 bg-[#0b0f1a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-50"
                >
                    <div className="text-center mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">New Entry</h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Select transaction type</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <button
                                key={action.name}
                                onClick={() => {
                                    navigate(action.path);
                                    setIsAddOpen(false);
                                }}
                                className="flex flex-col items-center gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group"
                            >
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-90 transition-all",
                                    action.color
                                )}>
                                    <action.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{action.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Modern Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    onClick={() => setIsMenuOpen(false)}
                />
                <motion.div
                    ref={menuRef}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute bottom-full left-4 right-4 mb-4 bg-[#0b0f1a] border border-white/10 rounded-[3rem] p-8 shadow-2xl z-50 overflow-hidden"
                >
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                        <Avatar src={user?.profileImage} name={user?.name} size="md" className="ring-2 ring-emerald-500/20" />
                        <div>
                            <p className="text-sm font-black text-white uppercase italic tracking-tight">{user?.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Authorized Administrator</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {extraItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-emerald-50/5 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                                    <item.icon size={16} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">{item.name}</span>
                            </Link>
                        ))}
                    </div>

                    <button
                        onClick={() => logout()}
                        className="w-full mt-6 flex items-center justify-center p-4 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                        <LogOut size={16} className="mr-2" /> Deauthorize Session
                    </button>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default BottomNavbar;
