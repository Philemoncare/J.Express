import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import {
  ChevronLeft, Calendar, Gauge, Droplet, Wrench,
  TrendingUp, Clock, User, Target, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: vehicle, isLoading } = useQuery(
    ['vehicle', id],
    () => fleetApi.getVehicle(id as string).then(res => res.data.data),
    { keepPreviousData: true }
  );

  if (isLoading && !vehicle) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-5 w-5" /></div>;
  if (!vehicle) return <div className="text-slate-500 font-black uppercase text-center py-20 tracking-widest text-[10px]">Node Offline</div>;

  const totalIncome = vehicle.incomes?.reduce((sum: number, i: any) => sum + Number(i.amount), 0) || 0;
  const totalFuel = vehicle.fuelPurchases?.reduce((sum: number, f: any) => sum + Number(f.totalCost), 0) || 0;
  const totalExpenses = (vehicle.expenses?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0) + totalFuel;
  const netProfit = totalIncome - totalExpenses;

  const format = (val: number) => new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0
  }).format(val);

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/vehicles')} className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors border border-white/5 text-slate-500 shrink-0">
            <ChevronLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[10px] sm:text-xs font-black text-white uppercase italic tracking-[0.2em] truncate">{vehicle.vehicleName}</h1>
                <div className={clsx("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", vehicle.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10")}>{vehicle.status}</div>
            </div>
            <p className="text-[9px] text-slate-600 font-black tracking-widest uppercase mt-0.5 truncate">
              {vehicle.brand} {vehicle.model} <span className="mx-2 text-white/5">|</span> <span className="text-emerald-500/70 font-mono tracking-tighter">{vehicle.plateNumber}</span>
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right pl-11 sm:pl-0">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Net Yield</p>
            <p className={clsx("text-sm sm:text-base font-black tracking-tight", netProfit >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {netProfit >= 0 ? '+' : ''}{format(netProfit)}
            </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 min-h-0">
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            <StatCard icon={<Gauge size={12} />} label="Telemetry" value={`${Number(vehicle.mileage).toLocaleString()} KM`} color="blue" />
            <StatCard icon={<Droplet size={12} />} label="Energy Logs" value={vehicle._count?.fuelPurchases || 0} color="orange" />
            <StatCard icon={<Target size={12} />} label="Efficiency" value={`${totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%`} color="green" />
          </div>

          <div className="bg-[#0b0f1a] border border-white/5 rounded-lg p-4 shadow-sm">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5">Financial Metrics</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-slate-600 uppercase">Gross Revenue</span>
                    <p className="text-[11px] font-black text-white tracking-tight">{format(totalIncome)}</p>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-slate-600 uppercase">Operational Burn</span>
                    <p className="text-[11px] font-black text-white tracking-tight">{format(totalExpenses)}</p>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: totalIncome > 0 ? `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` : '0%' }} className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f1a] border border-white/5 rounded-lg flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Energy Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
              {vehicle.fuelPurchases?.length > 0 ? vehicle.fuelPurchases.slice(0, 5).map((log: any) => (
                <div key={log.id} className="px-4 py-2 flex items-center justify-between hover:bg-white/[0.01] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-orange-500/10 border border-orange-500/10 flex items-center justify-center text-orange-500"><Droplet size={10} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-200 uppercase italic tracking-tight truncate">{log.stationName || 'Fleet Terminal'}</p>
                      <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{new Date(log.date).toLocaleDateString()} • {log.liters}L Volume</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-rose-500 tracking-tighter">-{format(Number(log.totalCost))}</p>
                </div>
              )) : <div className="flex-1 flex items-center justify-center text-[9px] font-black uppercase text-slate-700 tracking-widest">No Logs Found</div>}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-lg p-4 shadow-sm">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Specifications</h3>
            <div className="space-y-1">
                <InfoItem icon={<Calendar size={10} />} label="Commission" value={vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toLocaleDateString() : 'N/A'} />
                <InfoItem icon={<Wrench size={10} />} label="Service" value="3k KM" />
                <InfoItem icon={<User size={10} />} label="Operator" value={vehicle.creator?.name?.split(' ')[0] || 'System'} />
                <InfoItem icon={<Clock size={10} />} label="State" value={vehicle.status} isStatus />
            </div>
          </div>
          <div className="bg-emerald-600 rounded-lg p-4 shadow-lg shadow-emerald-600/10 text-white relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-100">Lifetime Telemetry</p>
                <div className="text-xl font-black tracking-tighter mt-1">{Number(vehicle.mileage).toLocaleString()} <span className="text-[10px] opacity-60 font-black">KM</span></div>
            </div>
            <Gauge size={40} className="absolute -right-2 -bottom-2 opacity-10 -rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-[#0b0f1a] border border-white/5 rounded-lg p-3 flex items-center gap-3 hover:bg-white/[0.01] transition-colors">
    <div className={clsx(
      "p-1.5 rounded border",
      color === 'blue' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" :
      color === 'green' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" :
      "text-orange-500 bg-orange-500/10 border-orange-500/10"
    )}>
      {icon}
    </div>
    <div>
      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
      <p className="text-[11px] font-black text-white tracking-tight mt-0.5">{value}</p>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value, isStatus }: any) => (
  <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-2">
      <div className="text-slate-600">{icon}</div>
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    {isStatus ? (
      <span className={clsx("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", value === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10")}>{value}</span>
    ) : <span className="text-[10px] font-black text-slate-300 uppercase italic">{value}</span>}
  </div>
);

export default VehicleDetailsPage;
