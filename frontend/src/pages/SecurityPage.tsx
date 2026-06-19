import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Clock, Monitor, Globe, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const SecurityPage = () => {
  const { fetchLoginAttempts, fetchSecurityLogs } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'access' | 'audit'>('access');

  const { data: attempts, isLoading: loadingAttempts } = useQuery(['login-attempts'], fetchLoginAttempts, { keepPreviousData: true });
  const { data: securityLogs, isLoading: loadingSecurity } = useQuery(['security-logs'], fetchSecurityLogs, { keepPreviousData: true });

  if ((loadingAttempts && !attempts) || (loadingSecurity && !securityLogs)) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-5 w-5" /></div>;

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="text-blue-500" size={24} />
            Security Protocol & Audit
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time monitoring of all system access and security events.</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">System Status</p>
                <p className="text-xs font-bold text-white uppercase italic mt-1">Active Monitoring</p>
            </div>
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden">
                <img src="/images/3D Driver Icon in Isometric View with Transparent Background.jpg" className="w-full h-full object-contain rounded-xl" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat cards same as before */}
        <div className="bg-[#0b0f1a] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Multi-Factor Auth</span>
          </div>
          <p className="text-white text-lg font-bold">Enabled</p>
          <p className="text-slate-500 text-[10px]">Unified OTP verification active.</p>
        </div>
        <div className="bg-[#0b0f1a] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-500">
            <Globe size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Access Control</span>
          </div>
          <p className="text-white text-lg font-bold">Single-User Locked</p>
          <p className="text-slate-500 text-[10px]">Strictly restricted to administrator email.</p>
        </div>
        <div className="bg-[#0b0f1a] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-orange-500">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Rate Limiting</span>
          </div>
          <p className="text-white text-lg font-bold">Active</p>
          <p className="text-slate-500 text-[10px]">Automatic block after 5 failed attempts.</p>
        </div>
      </div>

      <div className="bg-[#0b0f1a] border border-white/5 rounded-xl flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex bg-black/40 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('access')}
              className={clsx(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                activeTab === 'access' ? "bg-white text-black" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Access Log
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={clsx(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                activeTab === 'audit' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Security Audit
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'access' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.005]">
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Device / Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {attempts?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-slate-600" />
                        <div>
                          <p className="text-[11px] font-bold text-white">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter",
                        log.status.startsWith('SUCCESS') ? "bg-emerald-500/10 text-emerald-500" :
                        log.status === 'FAILED' ? "bg-rose-500/10 text-rose-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 font-mono">
                        <Globe size={12} className="text-slate-600" />
                        {log.ipAddress || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate max-w-[200px]">
                        <Monitor size={12} className="shrink-0 text-slate-600" />
                        {log.deviceInfo}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.005]">
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action Event</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {securityLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-slate-600" />
                        <div>
                          <p className="text-[11px] font-bold text-white">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 font-mono">
                        <Globe size={12} className="text-slate-600" />
                        {log.ipAddress || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate max-w-[200px]">
                        <Monitor size={12} className="shrink-0 text-slate-600" />
                        {log.deviceInfo}
                      </div>
                    </td>
                  </tr>
                ))}
                {securityLogs?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                      No critical security events recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
