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
      <div className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-4 h-28 sm:h-40 animate-pulse">
        <div className="w-8 h-8 bg-white/5 rounded-lg mb-3 sm:mb-8" />
        <div className="w-16 h-2.5 bg-white/5 rounded mb-2" />
        <div className="w-24 h-5 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div
      className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[110px] sm:min-h-[160px]"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-8">
        <div className={clsx(
          "w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg",
          color === 'blue' ? "bg-blue-600 text-white" :
          color === 'green' ? "bg-emerald-600 text-white" :
          color === 'red' ? "bg-rose-600 text-white" : "bg-orange-600 text-white"
        )}>
          <Icon size={18} className="sm:w-6 sm:h-6" />
        </div>
        {change && (
           <div className={clsx(
             "px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-0.5",
             change > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
           )}>
             {change > 0 ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
             {Math.abs(change)}%
           </div>
        )}
      </div>

      <div>
        <p className="text-[7px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1">{title}</p>
        <h2 className="text-lg sm:text-3xl font-black text-white tracking-tighter truncate">
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight italic uppercase">Command Center</h1>
          <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] mt-0.5">Real-time operational telemetry</p>
        </div>
        <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-white/[0.03] border border-white/5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Status
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
            "bg-[#0b0f1a] border rounded-[1.5rem] p-5 shadow-xl flex items-center gap-4 group cursor-default relative overflow-hidden",
            analysis?.status_color === 'green' ? "border-emerald-500/20" :
            analysis?.status_color === 'red' ? "border-rose-500/20" : "border-blue-500/20"
        )}
      >
        <div className={clsx(
            "absolute inset-0 pointer-events-none",
            analysis?.status_color === 'green' ? "bg-emerald-500/[0.02]" :
            analysis?.status_color === 'red' ? "bg-rose-500/[0.02]" : "bg-blue-500/[0.02]"
        )} />
        <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
            analysis?.status_color === 'green' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
            analysis?.status_color === 'red' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
        )}>
          <Activity className={clsx(isAnalysisLoading && "animate-pulse")} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={clsx(
            "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
            analysis?.status_color === 'green' ? "text-emerald-500" :
            analysis?.status_color === 'red' ? "text-rose-500" : "text-blue-500"
          )}>System Intelligence</p>
          <p className="text-sm font-bold text-slate-200 leading-tight italic">
            {isAnalysisLoading ? "Processing telemetry..." : (analysis?.ai_summary || "Operational performance is within established parameters.")}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="xl:col-span-8 flex flex-col space-y-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-[2rem] p-6 shadow-sm overflow-hidden flex flex-col">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" /> Recent Transactions
            </h2>
            <div className="space-y-4">
              {isLoading ? Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />) :
                data?.recent_transactions?.map((tx: any, idx: number) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.05) }}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      tx.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-white tracking-tight uppercase italic truncate max-w-[150px] sm:max-w-none">{tx.display}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{tx.vehicle?.plateNumber || 'N/A'} • {new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={clsx("text-sm font-black tracking-tighter", tx.type === 'income' ? "text-emerald-500" : "text-rose-500")}>
                        {tx.type === 'income' ? '+' : '-'}{format(Number(tx.amount))}
                      </p>
                    </div>
                    <button
                      onClick={() => { if(confirm('Permanently delete this transaction?')) deleteMutation.mutate({ id: tx.id, type: tx.type }); }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col space-y-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-[2rem] p-6 shadow-sm">
             <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">Asset Health</h2>
             <div className="space-y-6">
                {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />) :
                  data?.status_distribution && Object.entries(data.status_distribution).map(([status, count]: any, idx: number) => (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                  >
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest capitalize">{status}</span>
                      <span className="text-xs font-black text-white">{count} Units</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.total_vehicles > 0 ? (count / data.total_vehicles) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={clsx(
                          "h-full rounded-full",
                          status === 'active' ? 'bg-emerald-500' : status === 'maintenance' ? 'bg-orange-500' : 'bg-rose-500'
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
             </div>
             <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Shield size={16} className="text-emerald-500" />
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Security</p>
                      <p className="text-xs font-black text-white uppercase italic mt-1">Operational</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Uptime</p>
                   <p className="text-lg font-black text-emerald-500 italic mt-0.5">99.9%</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
