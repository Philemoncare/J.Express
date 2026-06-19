import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import { X, Loader2, DollarSign, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface IncomeFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const { data: vehiclesResponse } = useQuery(['vehicles-list'], () => fleetApi.getVehicles({ limit: 100 }).then(res => res.data));
  const vehicles = vehiclesResponse?.data || [];

  const [formData, setFormData] = useState({
    vehicleId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.amount || !formData.date || !formData.source) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b0f1a] border border-white/10 rounded-lg w-full max-w-md shadow-2xl flex flex-col"
      >
        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            <div className="p-1 bg-emerald-500 rounded">
              <DollarSign size={12} className="text-white" />
            </div>
            Record Income
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Asset Selection</label>
              <div className="relative">
                <select
                  name="vehicleId"
                  required
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0b0f1a]">Choose asset...</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id} className="bg-[#0b0f1a]">
                      {v.vehicleName} — {v.plateNumber}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Amount (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Origin / Source</label>
              <input
                type="text"
                name="source"
                required
                placeholder="e.g. Trip Revenue"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description (Optional)</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Details..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Record Inflow'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default IncomeForm;
