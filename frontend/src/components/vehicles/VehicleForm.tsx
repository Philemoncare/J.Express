import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Car } from 'lucide-react';
import { motion } from 'framer-motion';

interface VehicleFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const VehicleForm = ({ initialData, onSubmit, isLoading, onCancel }: VehicleFormProps) => {
  const { register, handleSubmit } = useForm({
    defaultValues: initialData ? {
      ...initialData,
      insuranceExpiry: initialData.insuranceExpiry ? new Date(initialData.insuranceExpiry).toISOString().split('T')[0] : '',
      roadworthyExpiry: initialData.roadworthyExpiry ? new Date(initialData.roadworthyExpiry).toISOString().split('T')[0] : '',
      purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
    } : {
      status: 'active',
      fuelType: 'gasoline',
      transmission: 'automatic',
      mileage: 0,
      year: new Date().getFullYear()
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b0f1a] border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            <div className="p-1 bg-blue-600 rounded">
              <Car size={12} className="text-white" />
            </div>
            {initialData ? 'Update Asset' : 'Register Asset'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-white/5 rounded transition-colors text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Identity</p>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Asset Name</label>
                <input {...register('vehicleName', { required: true })} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Plate Number</label>
                <input {...register('plateNumber', { required: true })} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Make</label>
                  <input {...register('brand')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Model</label>
                  <input {...register('model')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Specifications</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Year</label>
                  <input type="number" {...register('year')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Mileage (km)</label>
                  <input type="number" {...register('mileage')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fuel</label>
                  <select {...register('fuelType')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white appearance-none cursor-pointer">
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Transmission</label>
                  <select {...register('transmission')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white appearance-none cursor-pointer">
                    <option value="automatic">Auto</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                <select {...register('status')} className="w-full px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded text-[11px] text-blue-400 font-bold appearance-none cursor-pointer">
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
               <div className="space-y-3">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Compliance</p>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Insurance Expiry</label>
                    <input type="date" {...register('insuranceExpiry')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white" />
                  </div>
               </div>
               <div className="space-y-3 pt-4 md:pt-6">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Roadworthy Expiry</label>
                    <input type="date" {...register('roadworthyExpiry')} className="w-full px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded text-[11px] text-white" />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-4 border-t border-white/5">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-[2] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : (initialData ? 'Update Profile' : 'Register Asset')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VehicleForm;
