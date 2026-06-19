import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import {
  Car, Plus, Search, Loader2,
  Trash2, Edit, ChevronLeft, ChevronRight
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import VehicleForm from '@/components/vehicles/VehicleForm';
import { toast } from 'react-hot-toast';

const VehiclesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: response, isLoading } = useQuery(
    ['vehicles', page, search, statusFilter],
    () => fleetApi.getVehicles({ page, search, status: statusFilter }).then(res => res.data),
    { keepPreviousData: true }
  );

  const createMutation = useMutation((data) => fleetApi.createVehicle(data), {
    onSuccess: () => { queryClient.invalidateQueries(['vehicles']); setIsModalOpen(false); toast.success('Asset Added'); }
  });

  const updateMutation = useMutation(({ id, data }: { id: string, data: any }) => fleetApi.updateVehicle(id, data), {
    onSuccess: () => { queryClient.invalidateQueries(['vehicles']); setIsModalOpen(false); setEditingVehicle(null); toast.success('Asset Updated'); }
  });

  const deleteMutation = useMutation((id: string) => fleetApi.deleteVehicle(id), {
    onSuccess: () => { queryClient.invalidateQueries(['vehicles']); toast.success('Asset Removed'); }
  });

  const vehicles = response?.data || [];
  const pagination = response?.pagination || { totalPages: 1 };

  if (isLoading && page === 1) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-5 w-5" /></div>;

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* 3D Asset Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 flex flex-col justify-center">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic mb-1">Fleet Registry</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inventory Management System</p>
        </div>
        <div className="md:col-span-4 bg-[#0b0f1a] border border-white/5 rounded-3xl p-6 flex flex-col justify-center group overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Assets</p>
            <h3 className="text-3xl font-black text-white italic tracking-tighter">{pagination.total || 0} UNITS</h3>
            <div className="mt-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-500/50 uppercase tracking-widest">Active Inventory</span>
            </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Operations</span>
        </div>
        <button
          onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={14} className="mr-2" /> Register New Asset
        </button>
      </div>

      <div className="bg-[#0b0f1a] border border-white/5 rounded-lg flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
        <div className="p-2 sm:p-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.01] gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-600" />
                <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory..."
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.02] border border-white/5 rounded text-[11px] text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 sm:px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded text-[10px] font-bold uppercase tracking-tight text-slate-500 focus:outline-none cursor-pointer min-w-[100px]"
            >
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maint.</option>
            </select>
          </div>
          <div className="hidden sm:block px-3 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
            {pagination.total || 0} Units Detected
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0b0f1a] z-10">
              <tr className="bg-white/[0.01] text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                <th className="px-4 py-2.5">Asset</th>
                <th className="px-4 py-2.5">Plate</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Odometer</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vehicles.map((v: any) => (
                <tr
                  key={v.id}
                  className="hover:bg-white/[0.01] transition-colors cursor-pointer group"
                  onClick={(e) => { if (!(e.target as HTMLElement).closest('button')) navigate(`/vehicles/${v.id}`); }}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                        <Car size={14} className={clsx(v.status === 'active' ? "text-emerald-500" : "text-slate-600")} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-200 truncate uppercase italic">{v.vehicleName}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">{v.make} {v.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-black font-mono text-emerald-500/50 tracking-widest">{v.plateNumber}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className={clsx(
                      "inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      v.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"
                    )}>
                      {v.status}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-black text-slate-400 tracking-tight">{Number(v.currentOdometer || v.mileage).toLocaleString()} <span className="text-[8px] text-slate-600 uppercase">km</span></span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingVehicle(v); setIsModalOpen(true); }} className="p-1 text-slate-500 hover:text-emerald-400"><Edit size={12} /></button>
                      <button onClick={() => { if (window.confirm('Delete Asset?')) deleteMutation.mutate(v.id); }} className="p-1 text-slate-500 hover:text-rose-400"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile List View */}
          <div className="sm:hidden flex flex-col divide-y divide-white/5">
            {vehicles.map((v: any) => (
              <div
                key={v.id}
                className="p-4 space-y-4 bg-white/[0.01]"
                onClick={() => navigate(`/vehicles/${v.id}`)}
              >
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <Car size={18} className={clsx(v.status === 'active' ? "text-emerald-500" : "text-slate-600")} />
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-white uppercase italic tracking-tight">{v.vehicleName}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">{v.make} {v.model}</p>
                      </div>
                   </div>
                   <div className={clsx(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      v.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"
                    )}>
                      {v.status}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Plate Number</p>
                      <p className="text-[11px] font-black font-mono text-emerald-500/70 tracking-widest">{v.plateNumber}</p>
                   </div>
                   <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Odometer</p>
                      <p className="text-[11px] font-black text-slate-300">{Number(v.currentOdometer || v.mileage).toLocaleString()} <span className="text-[8px] uppercase font-bold text-slate-600">KM</span></p>
                   </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditingVehicle(v); setIsModalOpen(true); }}
                        className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white"
                    >
                        <Edit size={12} /> Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete Asset?')) deleteMutation.mutate(v.id); }}
                        className="flex items-center gap-1.5 text-[9px] font-black text-rose-500/70 uppercase tracking-widest hover:text-rose-500"
                    >
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <p className="text-[9px] text-slate-600 font-black uppercase">Grid Page {page} / {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-all"><ChevronLeft size={14} /></button>
            <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <VehicleForm
            initialData={editingVehicle}
            isLoading={createMutation.isLoading || updateMutation.isLoading}
            onSubmit={(data: any) => editingVehicle ? updateMutation.mutate({ id: editingVehicle.id, data }) : createMutation.mutate(data)}
            onCancel={() => { setIsModalOpen(false); setEditingVehicle(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehiclesPage;
