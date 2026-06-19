import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import { X, Loader2, Fuel, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface FuelFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const FuelForm: React.FC<FuelFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const { data: vehiclesResponse } = useQuery(['vehicles-list'], () => fleetApi.getVehicles({ limit: 100 }).then(res => res.data));
  const vehicles = vehiclesResponse?.data || [];

  const [formData, setFormData] = useState({
    vehicleId: '',
    liters: '',
    costPerLiter: '',
    totalCost: '',
    odometerReading: '',
    date: new Date().toISOString().split('T')[0],
    stationName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'liters' || name === 'costPerLiter') {
        const liters = parseFloat(name === 'liters' ? value : prev.liters) || 0;
        const cpl = parseFloat(name === 'costPerLiter' ? value : prev.costPerLiter) || 0;
        newData.totalCost = (liters * cpl).toFixed(2);
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b0f1a] border border-white/10 rounded-lg w-full max-w-lg shadow-2xl flex flex-col"
      >
        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            <div className="p-1 bg-orange-600 rounded">
              <Fuel size={12} className="text-white" />
            </div>
            Log Energy Purchase
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
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0b0f1a]">Choose asset...</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id} className="bg-[#0b0f1a]">{v.vehicleName} — {v.plateNumber}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Volume (L)</label>
                <input
                  type="number"
                  step="0.01"
                  name="liters"
                  required
                  placeholder="0.00"
                  value={formData.liters}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Odometer (KM)</label>
                <input
                  type="number"
                  name="odometerReading"
                  required
                  placeholder="Current"
                  value={formData.odometerReading}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cost/Liter (GHS)</label>
                <input
                  type="number"
                  step="0.001"
                  name="costPerLiter"
                  required
                  placeholder="0.000"
                  value={formData.costPerLiter}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Total Cost</label>
                <div className="w-full px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded text-[11px] text-orange-400 font-black">
                  GHS {formData.totalCost || '0.00'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Station</label>
                <input
                  type="text"
                  name="stationName"
                  placeholder="Location"
                  value={formData.stationName}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Log Purchase'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FuelForm;
