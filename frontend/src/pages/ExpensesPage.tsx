import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import { TrendingDown, Plus, Loader2, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: expenses, isLoading } = useQuery(
    ['expenses'],
    () => fleetApi.getExpenses().then(res => res.data.data),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (data) => fleetApi.createExpense(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['financial-summary']);
        setIsModalOpen(false);
        toast.success('Expense recorded');
      },
      onError: (err: any) => {
        const message = err.response?.data?.message || err.message || 'Failed to log expense';
        toast.error(message);
      }
    }
  );

  const deleteMutation = useMutation(
    (id: string) => fleetApi.deleteExpense(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['expenses']);
        queryClient.invalidateQueries(['financial-summary']);
        toast.success('Record deleted');
      },
      onError: () => toast.error('Failed to delete record')
    }
  );

  if (isLoading && !expenses) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-5 w-5" /></div>;

  const format = (val: number) => new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0
  }).format(val);

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-[10px] sm:text-xs font-black text-white tracking-[0.2em] uppercase italic flex items-center gap-2">
           <div className="w-1 h-3 bg-rose-500 rounded-sm" /> Expenditure Ledger
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[9px] font-black uppercase tracking-widest transition-all"
        >
          <Plus size={12} className="mr-1.5" /> Log Expenditure
        </button>
      </div>

      <div className="bg-[#0b0f1a] border border-white/5 rounded-lg flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">
        <div className="p-2 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="px-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            Burn Analysis
          </div>
          <div className="px-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            {expenses?.length || 0} Entries
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0b0f1a] z-10">
              <tr className="bg-white/[0.01] text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Asset</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses?.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-6 h-6 rounded flex items-center justify-center border shrink-0",
                        expense.category === 'Revenue Transfer' ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-500" : "bg-white/5 border-white/5 text-slate-500"
                      )}>
                        <TrendingDown size={12} />
                      </div>
                      <span className={clsx(
                        "text-[11px] font-bold uppercase italic truncate",
                        expense.category === 'Revenue Transfer' ? "text-emerald-500" : "text-slate-200"
                      )}>{expense.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{expense.vehicle?.vehicleName}</span>
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">{expense.vehicle?.plateNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={clsx(
                      "text-[11px] font-black tracking-tight",
                      expense.category === 'Revenue Transfer' ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {expense.category === 'Revenue Transfer' ? '+' : '-'}{format(Number(expense.amount))}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { if(confirm('Delete this record?')) deleteMutation.mutate(expense.id); }}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile List View */}
          <div className="sm:hidden flex flex-col divide-y divide-white/5">
            {expenses?.map((expense: any) => (
              <div key={expense.id} className="p-4 space-y-3 bg-white/[0.01]">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center border",
                        expense.category === 'Revenue Transfer' ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-500" : "bg-white/5 border-white/5 text-slate-500"
                      )}>
                        <TrendingDown size={14} />
                      </div>
                      <div>
                        <p className={clsx(
                          "text-[11px] font-black uppercase italic",
                          expense.category === 'Revenue Transfer' ? "text-emerald-500" : "text-white"
                        )}>{expense.category}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <p className={clsx(
                        "text-[13px] font-black tracking-tight",
                        expense.category === 'Revenue Transfer' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {expense.category === 'Revenue Transfer' ? '+' : '-'}{format(Number(expense.amount))}
                      </p>
                      <button
                        onClick={() => { if(confirm('Delete this record?')) deleteMutation.mutate(expense.id); }}
                        className="p-2 bg-rose-500/5 text-rose-500 rounded-lg active:scale-90 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5 flex items-center justify-between">
                   <div>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Assigned Asset</p>
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{expense.vehicle?.vehicleName}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black font-mono text-slate-500 tracking-widest mt-2">{expense.vehicle?.plateNumber}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ExpenseForm
            onSubmit={(data: any) => createMutation.mutate(data)}
            onCancel={() => setIsModalOpen(false)}
            isLoading={createMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpensesPage;
