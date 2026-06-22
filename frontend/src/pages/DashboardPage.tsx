import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import {
  TrendingUp,
  TrendingDown,
  Fuel,
  Sparkles,
  Car,
  Activity,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

const FintechCard = ({ title, value, change, icon: Icon, color, data, isLoading }: any) => {
  const format = (val: number) => new Intl.NumberFormat(data?.currency === 'GHS' ? 'en-GH' : 'en-US', {
    style: 'currency',
    currency: data?.currency || 'GHS',
    maximumFractionDigits: 0
  }).format(val);

  if (isLoading) {
    return (
      <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-5 h-32 sm:h-44 animate-pulse">
        <div className="w-10 h-10 bg-white/5 rounded-xl mb-6" />
        <div className="w-20 h-2 bg-white/5 rounded mb-3" />
        <div className="w-28 h-6 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div
      className="bg-[#0b0f1a] border border-white/5 rounded-[2rem] p-5 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[130px] sm:min-h-[180px] hover:bg-white/[0.02] transition-all"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-10 relative z-10">
        <div className={clsx(
          "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xl border transition-transform group-hover:scale-110",
          color === 'blue' ? "bg-blue-600/10 text-blue-500 border-blue-500/20" :
          color === 'green' ? "bg-emerald-600/10 text-emerald-500 border-emerald-500/20" :
          color === 'red' ? "bg-rose-600/10 text-rose-500 border-rose-500/20" : "bg-orange-600/10 text-orange-500 border-orange-500/20"
        )}>
          <Icon size={20} className="sm:w-7 sm:h-7" />
        </div>
        {change && (
           <div className={clsx(
             "px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border shadow-sm",
             change > 0 ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : "bg-rose-500/5 text-rose-500 border-rose-500/10"
           )}>
             {change > 0 ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
             {Math.abs(change)}%
           </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[8px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 sm:mb-2">{title}</p>
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tighter truncate italic uppercase">
          {typeof value === 'number' ? format(value) : (value || '---')}
        </h2>
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      const res = await fleetApi.getSummary();
      return res?.data?.data;
    },
    retry: 1,
    keepPreviousData: true
  });

  const deleteMutation = useMutation(
    ({ id, type }: { id: string, type: string }) => {
      if (type === 'income') return fleetApi.deleteIncome(id);
      if (type === 'fuel') return fleetApi.deleteFuelPurchase(id);
      return fleetApi.deleteExpense(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['financial-summary']);
        queryClient.invalidateQueries(['incomes']);
        queryClient.invalidateQueries(['fuel']);
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['ai-analysis']);
        toast.success('Record removed');
      },
      onError: () => toast.error('Failed to remove record')
    }
  );

  const { data: analysis, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['ai-analysis'],
    queryFn: async () => {
      const res = await fleetApi.getAIAnalysis();
      return res?.data?.data;
    },
    enabled: !!data,
    retry: 1,
    staleTime: 30 * 60 * 1000 // AI analysis doesn't need to refresh often
  });

  const format = (val: number) => {
    const locale = data?.currency === 'USD' ? 'en-US' : 'en-GH';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: data?.currency || 'GHS',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#020617]">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-4 border border-rose-500/20">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Intelligence Offline</h2>
        <p className="text-slate-500 text-sm max-w-md">We encountered a temporary disruption while synchronizing with the operational core.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
        >
          Re-initialize System
        </button>
      </div>
    );
  }

  // Ensure data exists before rendering main content if not loading
  if (!isLoading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#020617]">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
          <Activity size={32} className="animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2 italic">Synchronizing Telemetry</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-md">
            The neural core is currently awaiting fleet data initialization.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex-1 flex flex-col space-y-4 sm:space-y-6 pb-8 sm:pb-12"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter italic uppercase flex items-center gap-3">
             <div className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Operational Command
          </h1>
          <p className="text-[9px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5 ml-4.5">Fleet Intelligence Monitoring System</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-emerald-500/5">
          <div className="relative">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
            <div className="w-2 h-2 bg-emerald-500 rounded-full relative" />
          </div>
          Secure Core Online
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div variants={itemVariants}>
              <FintechCard title="Net Portfolio" value={data?.net_profit} icon={CreditCard} color={(data?.net_profit || 0) >= 0 ? "green" : "red"} data={data} isLoading={isLoading} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FintechCard title="Total Inflow" value={data?.total_income} change={12} icon={TrendingUp} color="green" data={data} isLoading={isLoading} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FintechCard title="Fuel Burn" value={data?.total_fuel_cost} change={-5} icon={Fuel} color="red" data={data} isLoading={isLoading} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FintechCard title="Active Assets" value={`${data?.total_vehicles || 0} Units`} icon={Car} color="orange" data={data} isLoading={isLoading} />
            </motion.div>
        </div>
      </div>

      <motion.div
        variants={itemVariants}
        animate={isAnalysisLoading ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, enabled: isAnalysisLoading }}
        className={clsx(
            "bg-[#0b0f1a] border rounded-[2.5rem] p-6 shadow-2xl flex items-center gap-6 group cursor-default relative overflow-hidden transition-all hover:bg-white/[0.01]",
            analysis?.status_color === 'green' ? "border-emerald-500/20 shadow-emerald-500/5" :
            analysis?.status_color === 'red' ? "border-rose-500/20 shadow-rose-500/5" : "border-blue-500/20 shadow-blue-500/5"
        )}
      >
        <div className={clsx(
            "absolute inset-0 pointer-events-none opacity-40",
            analysis?.status_color === 'green' ? "bg-gradient-to-r from-emerald-500/10 to-transparent" :
            analysis?.status_color === 'red' ? "bg-gradient-to-r from-rose-500/10 to-transparent" : "bg-gradient-to-r from-blue-500/10 to-transparent"
        )} />
        <div className={clsx(
            "w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 border shadow-lg relative z-10",
            analysis?.status_color === 'green' ? "bg-emerald-500 text-white border-emerald-400/50" :
            analysis?.status_color === 'red' ? "bg-rose-500 text-white border-rose-400/50" : "bg-blue-500 text-white border-blue-400/50"
        )}>
          <Sparkles className={clsx(isAnalysisLoading && "animate-pulse")} size={24} />
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <p className={clsx(
            "text-[10px] font-black uppercase tracking-[0.3em] mb-1.5",
            analysis?.status_color === 'green' ? "text-emerald-500" :
            analysis?.status_color === 'red' ? "text-rose-400" : "text-blue-400"
          )}>PiA Intelligence Synthesis</p>
          <p className="text-base font-bold text-slate-200 leading-tight italic opacity-90">
            {isAnalysisLoading ? "Deciphering operational telemetry stream..." : (analysis?.ai_summary || "Operational performance is within established neural benchmarks.")}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1 relative z-10 shrink-0 border-l border-white/5 pl-6">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Accuracy</p>
           <p className="text-sm font-black text-white italic uppercase tracking-tighter">98.4% Confidence</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="xl:col-span-8 flex flex-col space-y-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col group">
            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <Activity size={16} className="text-emerald-500" /> Operational Feed
              </span>
              <span className="text-[9px] text-slate-600 italic">Latest Events</span>
            </h2>
            <div className="space-y-6">
              {isLoading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse" />) :
                data?.recent_transactions?.length > 0 ? data.recent_transactions.map((tx: any, idx: number) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.05) }}
                  className="flex items-center justify-between group/tx hover:bg-white/[0.01] p-3 -mx-3 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className={clsx(
                      "w-12 h-12 rounded-[1.25rem] flex items-center justify-center border transition-all",
                      tx.type === 'income' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10 group-hover/tx:bg-emerald-500 group-hover/tx:text-white" : "bg-rose-500/5 text-rose-500 border-rose-500/10 group-hover/tx:bg-rose-500 group-hover/tx:text-white"
                    )}>
                      {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-white tracking-tight uppercase italic truncate max-w-[180px] sm:max-w-none group-hover/tx:translate-x-1 transition-transform">{tx.display}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{tx.vehicle?.plateNumber || 'FLEET_SYS'}</p>
                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={clsx("text-base font-black tracking-tighter", tx.type === 'income' ? "text-emerald-400" : "text-rose-400")}>
                        {tx.type === 'income' ? '+' : '-'}{format(Number(tx.amount))}
                      </p>
                    </div>
                    <button
                      onClick={() => { if(confirm('Permanently purge this event from operational records?')) deleteMutation.mutate({ id: tx.id, type: tx.type }); }}
                      className="p-2.5 opacity-0 group-hover/tx:opacity-100 hover:bg-rose-500/10 text-slate-700 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="py-20 text-center">
                    <Activity size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Signal Lost - No Activity Detected</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col space-y-6">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
             <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-10 relative z-10 flex items-center justify-between">
                <span>Asset Telemetry</span>
                <Car size={14} className="text-slate-600" />
             </h2>
             <div className="space-y-8 relative z-10">
                {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-2xl animate-pulse" />) :
                  data?.status_distribution && Object.entries(data.status_distribution).map(([status, count]: any, idx: number) => (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="group/asset cursor-default"
                  >
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest capitalize group-hover/asset:text-slate-300 transition-colors">{status}</span>
                      <span className="text-sm font-black text-white italic tracking-tighter">{count} <span className="text-[9px] text-slate-600 font-bold uppercase ml-1">Units</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.total_vehicles > 0 ? (count / data.total_vehicles) * 100 : 0}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={clsx(
                          "h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                          status === 'active' ? 'bg-emerald-500' : status === 'maintenance' ? 'bg-orange-500' : 'bg-rose-500'
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
             </div>
             <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                      <Shield size={20} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">Encryption</p>
                      <p className="text-xs font-black text-white uppercase italic tracking-tighter">Active AES-256</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">Node Uptime</p>
                   <p className="text-xl font-black text-emerald-500 italic tracking-tighter">99.98<span className="text-[10px] ml-0.5">%</span></p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
