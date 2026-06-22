import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import { Fuel, Plus, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FuelForm from '@/components/fuel/FuelForm';
import { toast } from 'react-hot-toast';

const FuelPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: fuelLogs, isLoading } = useQuery(
    ['fuel'],
    () => fleetApi.getFuelPurchases().then(res => res.data.data),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (data) => fleetApi.createFuelPurchase(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['fuel']);
        queryClient.invalidateQueries(['financial-summary']);
        setIsModalOpen(false);
        toast.success('Fuel logged');
      },
      onError: (err: any) => {
        const message = err.response?.data?.message || err.message || 'Failed to record fuel';
        toast.error(message);
      }
    }
  );

  const deleteMutation = useMutation(
    (id: string) => fleetApi.deleteFuelPurchase(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['fuel']);
        queryClient.invalidateQueries(['financial-summary']);
        toast.success('Record deleted');
      },
      onError: () => toast.error('Failed to delete record')
    }
  );

  if (isLoading && !fuelLogs) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-5 w-5" /></div>;

  const format = (val: number) => new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0
  }).format(val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col space-y-4"
    >
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-[10px] sm:text-xs font-black text-white tracking-[0.2em] uppercase italic flex items-center gap-2">
           <div className="w-1 h-3 bg-orange-500 rounded-sm" /> Energy Registry
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all"
        >
          <Plus size={12} className="mr-1.5" /> Log Energy
        </button>
      </div>

      <div className="bg-[#0b0f1a] border border-white/5 rounded-lg flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
        <div className="p-2 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="px-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            Consumption Telemetry
          </div>
          <div className="px-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            {fuelLogs?.length || 0} Entries
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0b0f1a] z-10">
              <tr className="bg-white/[0.01] text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Station</th>
                <th className="px-4 py-2.5">Volume</th>
                <th className="px-4 py-2.5">Odometer</th>
                <th className="px-4 py-2.5 text-right">Cost</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {fuelLogs?.map((log: any, idx: number) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-white/[0.01] transition-colors group"
                >
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/10 shrink-0">
                        <Fuel size={12} className="text-orange-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-200 uppercase italic truncate">{log.stationName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-black text-slate-400 tracking-tight">{log.liters} <span className="text-[8px] text-slate-600 uppercase">L</span></span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-black text-slate-400 tracking-tight">{Number(log.odometerReading).toLocaleString()} <span className="text-[8px] text-slate-600 uppercase">KM</span></span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-[11px] font-black text-orange-400 tracking-tight">
                      {format(Number(log.totalCost))}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { if(confirm('Delete this record?')) deleteMutation.mutate(log.id); }}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Mobile List View */}
          <div className="sm:hidden flex flex-col divide-y divide-white/5">
            {fuelLogs?.map((log: any, idx: number) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 space-y-3 bg-white/[0.01]"
              >
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
                        <Fuel size={14} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase italic">{log.stationName || 'N/A'}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">{new Date(log.date).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <p className="text-[13px] font-black text-orange-400 tracking-tight">{format(Number(log.totalCost))}</p>
                      <button
                        onClick={() => { if(confirm('Delete this record?')) deleteMutation.mutate(log.id); }}
                        className="p-2 bg-rose-500/5 text-rose-500 rounded-lg active:scale-90 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Fuel Volume</p>
                      <p className="text-[11px] font-black text-slate-300">{log.liters} <span className="text-[8px] uppercase">Liters</span></p>
                   </div>
                   <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5 text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Odometer</p>
                      <p className="text-[11px] font-black text-slate-300">{Number(log.odometerReading).toLocaleString()} <span className="text-[8px] uppercase">KM</span></p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <FuelForm
            onSubmit={(data: any) => createMutation.mutate(data)}
            onCancel={() => setIsModalOpen(false)}
            isLoading={createMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FuelPage;
