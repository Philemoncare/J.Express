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
  Trash2,
  Activity
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
      <motion.div variants={itemVariants} className="bg-[#0b0f1a] border border-white/5 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 relative z-10">
            {/* Income */}
            <div className="flex flex-row lg:flex-col items-center lg:text-center gap-5 flex-1 w-full lg:w-auto group/item">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-lg shadow-emerald-500/5 transition-transform group-hover/item:scale-110">
                    <TrendingUp size={24} className="sm:w-8 sm:h-8" />
                </div>
                <div>
                    <p className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Gross Inflow</p>
                    <p className="text-xl sm:text-3xl font-black text-white tracking-tighter mt-1 italic uppercase">{formatValue(summary?.total_income || 0)}</p>
                </div>
            </div>

            <div className="text-slate-800 font-black text-3xl hidden lg:block opacity-40">−</div>
            <div className="w-full h-px bg-white/5 lg:hidden" />

            {/* Deductions Group */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 flex-1 w-full lg:w-auto">
                <div className="flex flex-row sm:flex-col items-center sm:text-center gap-5 w-full sm:w-auto group/item">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-500/10 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-rose-500 border border-rose-500/10 shadow-lg shadow-rose-500/5 transition-transform group-hover/item:scale-110">
                        <TrendingDown size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <p className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">General Ops</p>
                        <p className="text-lg sm:text-2xl font-black text-slate-300 tracking-tighter mt-1 italic uppercase">{formatValue(summary?.total_expense || 0)}</p>
                    </div>
                </div>

                <div className="text-slate-800 font-black text-2xl hidden sm:block opacity-20">+</div>

                <div className="flex flex-row sm:flex-col items-center sm:text-center gap-5 w-full sm:w-auto group/item">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500/10 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-orange-500 border border-orange-500/10 shadow-lg shadow-orange-500/5 transition-transform group-hover/item:scale-110">
                        <Fuel size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <p className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Fuel Burn</p>
                        <p className="text-lg sm:text-2xl font-black text-slate-300 tracking-tighter mt-1 italic uppercase">{formatValue(summary?.total_fuel_cost || 0)}</p>
                    </div>
                </div>
            </div>

            <div className="text-emerald-500 font-black text-4xl hidden lg:block opacity-60">=</div>
            <div className="w-full h-px bg-white/5 lg:hidden" />

            {/* Final Result */}
            <div className="flex flex-row lg:flex-col items-center lg:text-center gap-5 flex-1 bg-white/[0.03] border border-white/10 p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] w-full lg:w-auto shadow-2xl relative group/result overflow-hidden">
                <div className={clsx(
                    "absolute inset-0 opacity-10 transition-colors duration-500",
                    (summary?.net_profit || 0) >= 0 ? "bg-emerald-500" : "bg-rose-500"
                )} />
                <div className={clsx(
                    "w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.75rem] flex items-center justify-center border-2 shadow-2xl shrink-0 transition-all duration-500 relative z-10",
                    (summary?.net_profit || 0) >= 0 ? "bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30 group-hover/result:scale-110" : "bg-rose-600 text-white border-rose-400 shadow-rose-500/30 group-hover/result:scale-110"
                )}>
                    <DollarSign size={28} className="sm:w-10 sm:h-10" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{ (summary?.net_profit || 0) >= 0 ? "Net Portfolio" : "Net Deficit"}</p>
                    <p className={clsx(
                        "text-2xl sm:text-4xl font-black tracking-tightest mt-1 italic uppercase",
                        (summary?.net_profit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>{formatValue(Math.abs(summary?.net_profit || 0))}</p>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Intelligence Sector */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 min-h-0">
        <motion.div variants={itemVariants} className="xl:col-span-8 flex flex-col gap-4">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/10 shadow-lg shadow-emerald-500/5">
                        <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Neural Intelligence Analysis</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest italic">Live Synthesis for {timeframe}</p>
                        </div>
                    </div>
                </div>
                <button
                  onClick={() => {
                    setDisplayText('');
                    refetchSummary();
                    refetchAI();
                    toast.success('Re-analyzing operational telemetry...');
                  }}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all disabled:opacity-50 border border-white/5 hover:text-white"
                  disabled={isSummaryLoading || isAnalysisLoading}
                >
                  <RefreshCw size={16} className={clsx((isSummaryLoading || isAnalysisLoading) && "animate-spin")} />
                </button>
             </div>

             <div className="space-y-6 relative z-10">
                <div className="flex gap-6">
                  <div className={clsx(
                    "w-1 h-auto min-h-[60px] rounded-full shrink-0",
                    analysis?.status_color === 'green' ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" :
                    analysis?.status_color === 'red' ? "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]" : "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  )} />
                  <div className="text-[15px] text-slate-200 leading-relaxed font-medium tracking-tight">
                    {displayText ? (
                      <div className="whitespace-pre-line italic font-serif opacity-90">"{displayText}"</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-4/6 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm group/card hover:bg-white/[0.04] transition-all">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={12} className="text-blue-400" /> Operational Vitality
                      </p>
                      <div className="flex items-end gap-2">
                        <span className={clsx(
                            "text-2xl font-black tracking-tighter leading-none",
                            analysis?.status_color === 'green' ? "text-emerald-400" :
                            analysis?.status_color === 'red' ? "text-rose-400" : "text-blue-400"
                        )}>{analysis?.status_label === 'Healthy' ? 'OPTIMAL' : analysis?.status_label === 'Critical Warning' ? 'HIGH RISK' : 'STABLE'}</span>
                      </div>
                      <p className="text-[9px] text-slate-600 font-black uppercase mt-3 tracking-tighter italic border-t border-white/5 pt-3">
                        {analysis?.net_profit >= 0 ? "Surplus generation active" : "Deficit mitigation required"}
                      </p>
                   </div>
                   <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-sm group/card hover:bg-white/[0.04] transition-all">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Fuel size={12} className="text-orange-400" /> Resource Consumption
                      </p>
                      <p className="text-[14px] text-slate-200 font-black tracking-tight uppercase leading-tight italic">{analysis?.fuel_efficiency}</p>
                      <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '70%' }}
                            className="h-full bg-orange-500/50 rounded-full"
                        />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[11px] font-black text-slate-500 mb-6 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
              <Zap size={16} className="text-emerald-500 fill-emerald-500 animate-pulse" /> Tactical Directives
            </h3>
            <div className="flex gap-5 overflow-x-auto pb-4 px-2 snap-x custom-scrollbar">
              {analysis?.recommendations?.map((rec: string, i: number) => (
                   <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -5 }}
                    className="min-w-[280px] sm:min-w-[320px] p-6 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 rounded-[2rem] space-y-5 hover:border-emerald-500/20 transition-all group/rec relative overflow-hidden snap-center"
                   >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 text-[14px] font-black border border-emerald-500/10 group-hover/rec:bg-emerald-500 group-hover/rec:text-white transition-all shadow-lg">
                            {i + 1}
                        </div>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover/rec:animate-ping" />
                      </div>
                      <p className="text-[13px] text-slate-300 font-bold leading-relaxed tracking-tight group-hover/rec:text-white transition-colors uppercase italic">{rec}</p>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-40 group-hover/rec:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover/rec:text-emerald-500">Priority High</span>
                        <TrendingUp size={12} className="text-slate-600 group-hover/rec:text-emerald-500" />
                      </div>
                   </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 w-full text-left relative z-10">Net Yield Ratio</h3>

            <div className="relative flex items-center justify-center py-6 relative z-10">
               {/* Decorative Glow */}
               <div className={clsx(
                   "absolute inset-0 blur-[40px] opacity-20 rounded-full transition-colors duration-1000",
                   analysis?.status_color === 'green' ? "bg-emerald-500" :
                   analysis?.status_color === 'red' ? "bg-rose-500" : "bg-blue-500"
               )} />

               <svg className="w-48 h-48 -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                 <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/[0.03]" />
                 <motion.circle
                   initial={{ strokeDashoffset: 527.7 }}
                   animate={{ strokeDashoffset: 527.7 - (527.7 * Math.max(0, Math.min(100, Number(analysis?.profit_margin) || 0)) / 100) }}
                   transition={{ duration: 2, ease: "circOut" }}
                   cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="16" fill="transparent"
                   className={clsx(
                    "transition-colors duration-1000",
                    analysis?.status_color === 'green' ? "text-emerald-500" :
                    analysis?.status_color === 'red' ? "text-rose-500" : "text-blue-500"
                   )}
                   strokeDasharray={527.7}
                   strokeLinecap="round"
                 />
               </svg>
               <div className="absolute flex flex-col items-center">
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-black text-white tracking-tighter"
                  >
                    {Math.abs(analysis?.profit_margin || 0)}%
                  </motion.span>
                  <span className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-widest italic bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {analysis?.profit_margin >= 0 ? "Kept" : "Loss"}
                  </span>
               </div>
            </div>

            <p className="mt-8 text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic opacity-60">
                Calculated efficiency based on <br/> gross revenue vs operational burn
            </p>
          </div>

          <div className="bg-[#0b0f1a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Telemetry Log</h3>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
            </div>
            <div className="divide-y divide-white/[0.03] overflow-y-auto custom-scrollbar flex-1">
               {summary?.recent_transactions?.length > 0 ? summary?.recent_transactions?.map((tx: any, idx: number) => (
                 <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (idx * 0.05) }}
                    className="px-6 py-4 flex items-center gap-5 hover:bg-white/[0.02] transition-all group cursor-default"
                 >
                    <div className={clsx(
                      "w-1 h-10 rounded-full transition-all group-hover:w-1.5",
                      tx.type === 'income' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-black text-slate-200 truncate uppercase tracking-tight italic group-hover:text-white transition-colors">{tx.display}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                        <span className="text-slate-800">•</span>
                        <p className="text-[9px] text-slate-600 font-black uppercase italic">{tx.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className={clsx("text-[13px] font-black tracking-tighter", tx.type === 'income' ? "text-emerald-400" : "text-rose-400")}>
                            {tx.type === 'income' ? '+' : '-'}{formatValue(Number(tx.amount))}
                        </p>
                        <button
                          onClick={() => { if(confirm('Erase this record from ledger?')) deleteMutation.mutate({ id: tx.id, type: tx.type }); }}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                 </motion.div>
               )) : (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10"
                    >
                        <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-2xl relative group">
                            <Activity size={32} className="text-slate-700 group-hover:text-emerald-500/50 transition-colors duration-500" />
                            <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 italic">Signal Lost</h4>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest max-w-[180px] leading-relaxed">
                            No operational telemetry detected for the selected timeframe.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <div className="w-1 h-1 bg-slate-800 rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-slate-800 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1 h-1 bg-slate-800 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </motion.div>
                 </div>
               )}
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
    </motion.div>
  );
};

export default FinancialReportsPage;
