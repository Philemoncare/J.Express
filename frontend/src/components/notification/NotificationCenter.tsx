import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import { clsx } from 'clsx';

const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery(
        ['notifications'],
        () => fleetApi.getNotifications().then(res => res.data.data),
        { refetchInterval: 60000 } // Refetch every minute
    );

    const markReadMutation = useMutation(
        (id: string) => fleetApi.markNotificationAsRead(id),
        { onSuccess: () => queryClient.invalidateQueries(['notifications']) }
    );

    const markAllReadMutation = useMutation(
        () => fleetApi.markAllNotificationsAsRead(),
        { onSuccess: () => queryClient.invalidateQueries(['notifications']) }
    );

    const unreadCount = notifications.filter((n: any) => !n.readAt).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'info': return <Info size={14} className="text-blue-400" />;
            case 'warning': return <AlertTriangle size={14} className="text-orange-400" />;
            case 'error': return <AlertCircle size={14} className="text-rose-400" />;
            default: return <Info size={14} className="text-emerald-400" />;
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "relative p-2 rounded-full transition-all duration-300",
                    isOpen ? "bg-emerald-500/10 text-emerald-500" : "bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white"
                )}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#020617] animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-4 w-[320px] sm:w-[380px] bg-[#0b0f1a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                    >
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Notification Center</h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">{unreadCount} Unread Alerts</p>
                            </div>
                            <button
                                onClick={() => markAllReadMutation.mutate()}
                                className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all group"
                                title="Mark all as read"
                            >
                                <CheckCheck size={16} />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col">
                            {isLoading ? (
                                <div className="p-10 flex flex-col items-center justify-center gap-3">
                                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Syncing Stream</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-white/[0.02] rounded-2xl flex items-center justify-center text-slate-700 mb-4">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Alerts Detected</p>
                                    <p className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter mt-1">Your system is running clear.</p>
                                </div>
                            ) : (
                                notifications.map((n: any) => {
                                    const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => !n.readAt && markReadMutation.mutate(n.id)}
                                            className={clsx(
                                                "p-4 border-b border-white/5 flex gap-4 transition-all cursor-pointer relative group",
                                                !n.readAt ? "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.05]" : "hover:bg-white/[0.02] opacity-60"
                                            )}
                                        >
                                            <div className="shrink-0 mt-1">
                                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                                    {getIcon(n.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-[11px] font-black text-white uppercase tracking-tight italic truncate pr-4">
                                                        {data.title || 'System Alert'}
                                                    </p>
                                                    <span className="text-[8px] font-bold text-slate-600 uppercase whitespace-nowrap">
                                                        {timeAgo(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed line-clamp-2">
                                                    {data.message}
                                                </p>
                                            </div>
                                            {!n.readAt && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-3 bg-black/20 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Dismiss Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
