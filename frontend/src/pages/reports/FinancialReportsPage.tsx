import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetApi } from '@/api/fleet';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  TrendingUp,
  TrendingDown,
  Fuel,
  DollarSign,
  Loader2,
  Sparkles,
  Download,
  Zap,
  Bot,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import NeuralTerminal from '@/components/reports/NeuralTerminal';

const ReportMetric = ({ title, value, icon: Icon, color, currency }: any) => (
  <div className="bg-[#0b0f1a] border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/[0.02] transition-all group overflow-hidden relative">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
      <Icon size={48} strokeWidth={1} />
    </div>
    <div className="flex items-center gap-2.5 mb-3">
      <div className={clsx(
        "p-2 rounded-xl",
        color === 'green' ? "text-emerald-500 bg-emerald-500/10" :
        color === 'blue' ? "text-blue-500 bg-blue-500/10" :
        color === 'red' ? "text-rose-500 bg-rose-500/10" : "text-orange-500 bg-orange-500/10"
      )}>
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
    <p className="text-xl font-black text-white tracking-tight">
      {new Intl.NumberFormat(currency === 'GHS' ? 'en-GH' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)}
    </p>
  </div>
);

const CustomSelect = ({ value, onChange, options, label }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#0b0f1a] border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2 hover:bg-white/[0.03] transition-all min-w-[120px] justify-between"
            >
                <span>{selectedOption?.label}</span>
                <ChevronDown size={12} className={clsx("transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#0b0f1a] border border-white/10 rounded-xl shadow-2xl z-[150] overflow-hidden backdrop-blur-xl"
                    >
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={clsx(
                                    "w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                                    value === opt.value ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
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

const FinancialReportsPage = () => {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState('GHS');
  const [timeframe, setTimeframe] = useState('weekly');
  const [displayText, setDisplayText] = useState('');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery(
    ['financial-summary', currency, timeframe],
    () => fleetApi.getSummary({ currency, timeframe }).then(res => res.data.data),
    { keepPreviousData: true }
  );

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

  const { data: analysis, isLoading: isAnalysisLoading, isFetching: isAnalysisFetching, refetch: refetchAI } = useQuery(
    ['ai-analysis', currency, timeframe],
    () => fleetApi.getAIAnalysis({ currency, timeframe }).then(res => res.data.data),
    { keepPreviousData: true, staleTime: 5000 }
  );

  useEffect(() => {
    const fullText = analysis?.ai_summary;
    if (fullText && !isAnalysisFetching) {
      let i = 0;
      setDisplayText('');
      const interval = setInterval(() => {
        setDisplayText(fullText.substring(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(interval);
        }
      }, 10);
      return () => clearInterval(interval);
    } else if (isAnalysisFetching) {
        setDisplayText('');
    }
  }, [analysis, isAnalysisFetching]);

  const formatValue = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${currency} ${formatted}`;
  };

  const handleExport = () => {
    if (!summary) return;

    const doc = new jsPDF() as any;
    const isPartial = !summary.timeframe_valid;

    // Logo Placeholder or Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('J.EXPRESS', 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('FLEET OPERATIONAL INTELLIGENCE', 15, 26);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(`${timeframe.toUpperCase()} PERFORMANCE AUDIT`, 15, 40);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 46);
    doc.text(`Reporting Currency: ${currency}`, 15, 51);

    if (isPartial) {
        doc.setTextColor(245, 158, 11); // orange-500
        doc.setFont('helvetica', 'bolditalic');
        doc.text(`NOTICE: PRELIMINARY DATASET (${summary.data_days} DAYS)`, 15, 58);
        doc.setFont('helvetica', 'normal');
    }

    // KPI Section - Visual Boxes
    const kpiY = isPartial ? 65 : 60;
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, kpiY, 180, 35, 3, 3, 'FD');

    const metrics = [
        { label: 'GROSS REVENUE', value: formatValue(summary.total_income) },
        { label: 'OPERATIONAL BURN', value: formatValue(summary.total_expense + summary.total_fuel_cost) },
        { label: 'NET YIELD', value: formatValue(summary.net_profit) }
    ];

    metrics.forEach((m, i) => {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(m.label, 25 + (i * 60), kpiY + 12);
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text(m.value, 25 + (i * 60), kpiY + 22);
    });

    // Transactions Table
    if (summary.recent_transactions?.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('OPERATIONAL ACTIVITY LOG', 15, kpiY + 50);

        const txData = summary.recent_transactions.map((tx: any) => [
            new Date(tx.date).toLocaleDateString(),
            tx.display.toUpperCase(),
            tx.type.toUpperCase(),
            formatValue(tx.amount)
        ]);

        autoTable(doc, {
            startY: kpiY + 55,
            head: [['DATE', 'DESCRIPTION', 'TYPE', 'AMOUNT']],
            body: txData,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 4 },
            columnStyles: { 3: { halign: 'right' } }
        });
    }

    // AI Insight Section
    const lastY = (doc as any).lastAutoTable?.finalY || kpiY + 60;
    if (analysis?.ai_summary) {
        // Check if we need a new page
        let currentY = lastY + 20;
        if (currentY > 240) {
            doc.addPage();
            currentY = 20;
        }

        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.5);
        doc.line(15, currentY - 5, 30, currentY - 5);

        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('INTELLIGENCE SYNTHESIS', 15, currentY);

        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const splitText = doc.splitTextToSize(analysis.ai_summary, 175);
        doc.text(splitText, 15, currentY + 8);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(160);
        doc.text(`J.Express Fleet Intelligence System - Confidential`, 15, 285);
        doc.text(`Page ${i} of ${pageCount}`, 180, 285);
    }

    doc.save(`JExpress_Audit_${timeframe}_${new Date().getTime()}.pdf`);
    toast.success('Professional Audit Exported');
  };

  if (isSummaryLoading && !summary) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-5 w-5" /></div>;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex-1 flex flex-col space-y-4"
    >
      {/* Compact Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
           <div className="w-1 h-3 bg-emerald-500 rounded-sm" /> Financial Report
        </h1>
        <div className="flex flex-wrap gap-2">
            <CustomSelect
                value={currency}
                onChange={setCurrency}
                options={[
                    { value: 'GHS', label: 'GHS (₵)' },
                    { value: 'USD', label: 'USD ($)' }
                ]}
            />

            <CustomSelect
                value={timeframe}
                onChange={setTimeframe}
                options={[
                    { value: 'daily', label: "TODAY'S RECORD" },
                    { value: 'weekly', label: "THIS WEEK" },
                    { value: 'monthly', label: "THIS MONTH" },
                    { value: 'all', label: "ALL-TIME TOTAL" }
                ]}
            />

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              <Download size={14} /> EXPORT
            </button>
        </div>
      </motion.div>

      {/* Financial Flow Formula (Visual for Layman) */}
      <motion.div variants={itemVariants} className="bg-[#0b0f1a] border border-white/5 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />
        <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 sm:mb-8 text-center sm:text-left">Operational Cash Flow Breakdown</h3>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-8 lg:gap-4">
            {/* Income */}
            <div className="flex flex-row lg:flex-col items-center lg:text-center gap-4 lg:space-y-3 flex-1 w-full lg:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                    <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">Money Collected</p>
                    <p className="text-lg sm:text-2xl font-black text-white tracking-tighter mt-0.5 sm:mt-1">{formatValue(summary?.total_income || 0)}</p>
                </div>
            </div>

            <div className="text-slate-700 font-black text-2xl hidden lg:block">−</div>
            <div className="w-full h-px bg-white/5 lg:hidden" />

            {/* Deductions Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 flex-1 w-full lg:w-auto">
                <div className="flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:space-y-3 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20 shrink-0">
                        <TrendingDown size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">General Spent</p>
                        <p className="text-base sm:text-xl font-black text-slate-300 tracking-tighter mt-0.5 sm:mt-1">{formatValue(summary?.total_expense || 0)}</p>
                    </div>
                </div>

                <div className="text-slate-800 font-black text-xl hidden sm:block">+</div>

                <div className="flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:space-y-3 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0">
                        <Fuel size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">Fuel Spending</p>
                        <p className="text-base sm:text-xl font-black text-slate-300 tracking-tighter mt-0.5 sm:mt-1">{formatValue(summary?.total_fuel_cost || 0)}</p>
                    </div>
                </div>
            </div>

            <div className="text-emerald-500 font-black text-3xl hidden lg:block">=</div>
            <div className="w-full h-px bg-white/5 lg:hidden" />

            {/* Final Result */}
            <div className="flex flex-row lg:flex-col items-center lg:text-center gap-4 lg:space-y-3 flex-1 bg-white/[0.02] border border-white/5 p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] w-full lg:w-auto">
                <div className={clsx(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 shadow-2xl shrink-0",
                    (summary?.net_profit || 0) >= 0 ? "bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20" : "bg-rose-600 text-white border-rose-400 shadow-rose-500/20"
                )}>
                    <DollarSign size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">{ (summary?.net_profit || 0) >= 0 ? "Profit Remaining" : "Money Shortfall"}</p>
                    <p className={clsx(
                        "text-xl sm:text-3xl font-black tracking-tightest mt-0.5 sm:mt-1",
                        (summary?.net_profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>{formatValue(Math.abs(summary?.net_profit || 0))}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Intelligence Sector */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 min-h-0">
        <motion.div variants={itemVariants} className="xl:col-span-8 flex flex-col gap-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-lg p-5 shadow-sm relative overflow-hidden group">
             <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600/10 rounded text-emerald-400 border border-emerald-500/10">
                        <Zap size={18} />
                    </div>
                    <div>
                        <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Business Coach Explanation</h2>
                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Simple Summary for {timeframe}</p>
                    </div>
                </div>
                <button
                  onClick={() => {
                    setDisplayText('');
                    refetchSummary();
                    refetchAI();
                    toast.success('Analyzing records...');
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded text-slate-500 transition-all disabled:opacity-50"
                  disabled={isSummaryLoading || isAnalysisLoading}
                >
                  <RefreshCw size={14} className={clsx((isSummaryLoading || isAnalysisLoading) && "animate-spin")} />
                </button>
             </div>

             <div className="space-y-5">
                <div className="flex gap-4">
                  <div className={clsx(
                    "w-1.5 h-auto min-h-[40px] rounded-full shrink-0",
                    analysis?.status_color === 'green' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                    analysis?.status_color === 'red' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-blue-500"
                  )} />
                  <div className="text-sm text-slate-200 leading-relaxed font-medium">
                    {displayText ? (
                      <div className="whitespace-pre-line italic">"{displayText}"</div>
                    ) : (
                      <span className="italic text-slate-500 tracking-wide">PiA is reading your data...</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Money Health</p>
                      <div className="flex items-end gap-2">
                        <span className={clsx(
                            "text-xl font-black tracking-tight leading-none",
                            analysis?.status_color === 'green' ? "text-emerald-500" :
                            analysis?.status_color === 'red' ? "text-rose-500" : "text-blue-500"
                        )}>{analysis?.status_label === 'Healthy' ? 'Doing Well' : analysis?.status_label === 'Critical Warning' ? 'Spending Too Much' : 'Just Breaking Even'}</span>
                      </div>
                      <p className="text-[8px] text-slate-600 font-bold uppercase mt-2">{analysis?.net_profit >= 0 ? "You are saving money" : "You are losing money this period"}</p>
                   </div>
                   <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Fuel Spending Check</p>
                      <p className="text-[12px] text-slate-300 font-bold tracking-tight uppercase">{analysis?.fuel_efficiency}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-[#0b0f1a] border border-white/5 rounded-lg p-5 shadow-sm flex-1">
            <h3 className="text-[10px] font-black text-slate-500 mb-5 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-emerald-500 fill-emerald-500" /> Things to do next
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                   <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="p-4 bg-white/[0.01] border border-white/5 rounded-lg space-y-3"
                   >
                      <div className="w-7 h-7 rounded bg-emerald-600/10 flex items-center justify-center text-emerald-400 text-[11px] font-black">
                         {i + 1}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed tracking-tight">{rec}</p>
                   </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-lg p-5 shadow-sm flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5 w-full text-left">Money Kept</h3>
            <div className="relative flex items-center justify-center py-4">
               <svg className="w-40 h-40 -rotate-90">
                 <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/[0.02]" />
                 <motion.circle
                   initial={{ strokeDashoffset: 439.8 }}
                   animate={{ strokeDashoffset: 439.8 - (439.8 * Math.max(0, Math.min(100, Number(analysis?.profit_margin) || 0)) / 100) }}
                   transition={{ duration: 1.5, ease: "easeInOut" }}
                   cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                   className={clsx(
                    analysis?.status_color === 'green' ? "text-emerald-500" :
                    analysis?.status_color === 'red' ? "text-rose-500" : "text-blue-500"
                   )}
                   strokeDasharray={439.8}
                   strokeLinecap="round"
                 />
               </svg>
               <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white tracking-tighter">{Math.abs(analysis?.profit_margin || 0)}%</span>
                  <span className="text-[8px] font-black text-slate-600 uppercase mt-1 text-center px-6">
                    {analysis?.profit_margin >= 0 ? "kept as profit" : "more spent than earned"}
                  </span>
               </div>
            </div>
          </div>

          <div className="bg-[#0b0f1a] border border-white/5 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Activity</h3>
            </div>
            <div className="divide-y divide-white/[0.03]">
               {summary?.recent_transactions?.slice(0, 10).map((tx: any, idx: number) => (
                 <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.05) }}
                    className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.01] transition-colors group"
                 >
                    <div className={clsx(
                      "w-1 h-7 rounded-full",
                      tx.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-200 truncate uppercase tracking-tight">{tx.display}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className={clsx("text-xs font-black tracking-tighter", tx.type === 'income' ? "text-emerald-500" : "text-rose-500")}>
                            {tx.type === 'income' ? '+' : '-'}{formatValue(Number(tx.amount))}
                        </p>
                        <button
                          onClick={() => { if(confirm('Delete this record?')) deleteMutation.mutate({ id: tx.id, type: tx.type }); }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating PiA Trigger - Refined Minimalist Pill */}
      <div className="hidden sm:block fixed bottom-10 right-10 z-[100]">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsTerminalOpen(true)}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-[#0b0f1a] border border-emerald-500/20 text-emerald-500 rounded-full shadow-2xl hover:border-emerald-500/40 transition-all group backdrop-blur-xl"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">PiA</span>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </motion.button>
      </div>

      <NeuralTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        currency={currency}
      />
    </div>
  );
};

export default FinancialReportsPage;
