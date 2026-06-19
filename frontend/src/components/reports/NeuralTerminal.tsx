import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Send, X, Loader2, Terminal as TerminalIcon, TrendingUp, TrendingDown, Fuel, PieChart, BarChart, Sparkles } from 'lucide-react';
import { fleetApi } from '@/api/fleet';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  visualization?: {
    type: 'bar' | 'pie' | 'line';
    data: { label: string; value: number; color?: string }[];
  };
}

const NeuralTerminal = ({ isOpen, onClose, currency }: { isOpen: boolean; onClose: () => void; currency: string }) => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', parts: [{ text: message }] };
    setHistory(prev => [...prev, userMsg]);
    const currentInput = message;
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fleetApi.chatWithAI({ message: currentInput, history }, { currency });

      const replyText = response.data.reply;
      let visualization: any = null;

      if (replyText.includes("CHART_DATA:")) {
        try {
          const parts = replyText.split("CHART_DATA:");
          const jsonString = parts[1].trim();
          let bracketCount = 0;
          let endIndex = -1;
          for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === '{') bracketCount++;
            else if (jsonString[i] === '}') {
              bracketCount--;
              if (bracketCount === 0) {
                endIndex = i + 1;
                break;
              }
            }
          }
          if (endIndex !== -1) {
            visualization = JSON.parse(jsonString.substring(0, endIndex));
          } else {
            visualization = JSON.parse(jsonString);
          }
        } catch (e) {
          console.error("Visual Data Parse Error:", e);
        }
      }

      const aiMsg: Message = {
        role: 'model',
        parts: [{ text: replyText.split("CHART_DATA:")[0].trim() }],
        visualization
      };
      setHistory(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      toast.error(`Neural Link Interrupted: ${errorMsg}`);
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: `CRITICAL ERROR: ${errorMsg}. Please verify your API configuration and connectivity.` }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#020617] border-l border-white/10 z-[120] flex flex-col shadow-2xl">
            <div className="h-14 border-b border-white/5 bg-[#0b0f1a] flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white shadow-lg shadow-emerald-600/20"><Cpu size={14} /></div>
                <div>
                  <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">PiA Terminal</h2>
                  <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Active System Session</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors"><X size={16} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.03)_0%,_transparent_100%)]">
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-8">
                   <TerminalIcon size={40} className="mb-4 text-slate-600" />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">System awaiting operator query. Analysis ready for Fleet Assets, Burn Rates, and Yield Vectors.</p>
                </div>
              )}

              {history.map((msg, i) => (
                <div key={i} className={clsx("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={clsx("max-w-[90%] px-3 py-2 rounded-lg text-[11px] leading-relaxed font-bold", msg.role === 'user' ? "bg-emerald-600 text-white rounded-br-none" : "bg-[#0b0f1a] text-slate-300 border border-white/5 rounded-bl-none")}>
                    {msg.parts[0].text}
                    {msg.visualization && <Visualizer vis={msg.visualization} />}
                  </div>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mt-1 px-1">{msg.role === 'user' ? 'Operator' : 'PiA Core'}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-emerald-500">
                  <Loader2 size={12} className="animate-spin" />
                  <span className="text-[8px] font-black uppercase tracking-widest animate-pulse">Syncing Operational Data...</span>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-white/5 bg-[#0b0f1a]/50 grid grid-cols-2 gap-2">
               <QuickAction icon={<BarChart size={10} />} label="Asset Yield" onClick={() => setMessage("Compare vehicle profitability bar chart")} />
               <QuickAction icon={<TrendingDown size={10} />} label="Burn Audit" onClick={() => setMessage("Analyze expense trend line chart")} />
               <QuickAction icon={<PieChart size={10} />} label="Station Distribution" onClick={() => setMessage("Fuel station cost pie chart")} />
               <QuickAction icon={<TrendingUp size={10} />} label="Efficiency" onClick={() => setMessage("Asset efficiency scatter matrix")} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#0b0f1a]">
              <div className="relative">
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Query system core..." className="w-full bg-white/[0.03] border border-white/10 rounded-md pl-3 pr-10 py-2 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20" />
                <button type="submit" disabled={!message.trim() || isTyping} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-emerald-500 hover:text-emerald-400 disabled:opacity-20"><Send size={14} /></button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const Visualizer = ({ vis }: { vis: any }) => {
  const max = Math.max(...vis.data.map((d: any) => d.value), 1);

  return (
    <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 space-y-3">
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
        <Activity size={10} className="text-emerald-500" /> System Visualization: {vis.type} Chart
      </p>
      {vis.type === 'bar' && (
        <div className="space-y-2">
          {vis.data.map((d: any, i: number) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>{d.label}</span>
                <span>{d.value.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(d.value / max) * 100}%` }} className={clsx("h-full rounded-full", d.color || "bg-indigo-500")} />
              </div>
            </div>
          ))}
        </div>
      )}
      {vis.type === 'pie' && (
        <div className="flex flex-col items-center py-2">
           <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90">
                 {vis.data.reduce((acc: any, d: any, i: number) => {
                    const currentOffset = acc.offset;
                    const percentage = (d.value / vis.data.reduce((s: number, curr: any) => s + curr.value, 0)) * 100;
                    const strokeDash = (percentage * 251.2) / 100;
                    acc.elements.push(
                       <circle key={i} cx="40" cy="40" r="32" stroke={d.color || "#6366f1"} strokeWidth="8" fill="transparent" strokeDasharray={`${strokeDash} 251.2`} strokeDashoffset={-currentOffset} strokeLinecap="round" className="opacity-80" />
                    );
                    acc.offset += strokeDash;
                    return acc;
                 }, { elements: [], offset: 0 }).elements}
              </svg>
           </div>
           <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 w-full">
              {vis.data.map((d: any, i: number) => (
                 <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color || '#6366f1' }} />
                    <span className="text-[8px] font-black text-slate-500 uppercase truncate">{d.label}</span>
                 </div>
              ))}
           </div>
        </div>
      )}
      {vis.type === 'line' && (
        <div className="h-24 w-full pt-4">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={`M ${vis.data.map((d: any, i: number) => `${(i / (vis.data.length - 1)) * 100},${100 - (d.value / max) * 100}`).join(' L ')}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {vis.data.map((d: any, i: number) => (
                <circle key={i} cx={(i / (vis.data.length - 1)) * 100} cy={100 - (d.value / max) * 100} r="2" fill="#6366f1" />
              ))}
           </svg>
           <div className="flex justify-between mt-2">
              <span className="text-[7px] font-black text-slate-600 uppercase">{vis.data[0].label}</span>
              <span className="text-[7px] font-black text-slate-600 uppercase">{vis.data[vis.data.length - 1].label}</span>
           </div>
        </div>
      )}
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
    <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">{icon}</div>
    <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-tighter truncate">{label}</span>
  </button>
);

export default NeuralTerminal;
