import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Play, 
  CheckCircle, 
  Trash2, 
  Scale, 
  Layers,
  ArrowRight,
  Activity
} from 'lucide-react';
import { cn } from './lib/utils';
import { trpc } from './lib/trpc.ts';

export const Processing = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const { data: activeProcesses = [] } = trpc.listActiveProcesses.useQuery();

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">{t('processing.title')}</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium italic">Manage manufacturing and transformation cycles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Start New Process */}
        <div className="lg:col-span-1 luxury-card p-8 space-y-8 h-fit">
          <h3 className="font-bold text-primary flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-emerald-600" />
            </div>
            {t('processing.start')}
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t('processing.inputLot')}
              </label>
              <input 
                type="text" 
                placeholder="KF-PSD-2024-XXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t('processing.processType')}
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none appearance-none">
                <option>Cleaning</option>
                <option>Filleting</option>
                <option>Freezing</option>
                <option>Packing</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t('processing.outputProduct')}
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none appearance-none">
                <option>Whole Fish - Cleaned</option>
                <option>Skin-on Fillet</option>
                <option>Skin-off Fillet</option>
              </select>
            </div>
            <button className="w-full py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-primary/20">
              Initialize Process
            </button>
          </div>
        </div>

        {/* Active Processes */}
        <div className="lg:col-span-2 luxury-card overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-primary flex items-center gap-3 text-base">
              <Activity className="w-5 h-5 text-emerald-500" />
              Production Lines
            </h3>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {activeProcesses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-slate-400 gap-4 opacity-60">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  <Layers className="w-8 h-8" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em]">Zero Active Cycles</p>
              </div>
            ) : activeProcesses.map((proc: any) => (
              <div key={proc.processing_events.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:gold-gradient transition-all duration-500">
                      <Layers className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-primary text-lg">{`PRC-${proc.processing_events.id.toString().padStart(3, '0')}`}</span>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">In Progress</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-tighter">{proc.processing_events.type}</span>
                        <ArrowRight className={cn("w-4 h-4 text-slate-300", isRtl && "rotate-180")} />
                        <span className="text-primary font-black uppercase tracking-tighter">Lot #{proc.lots.lotId}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Input Mass</p>
                      <p className="text-lg font-mono font-black text-primary">{proc.processing_events.inputWeight} kg</p>
                    </div>
                    <button className="px-8 py-3 navy-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      {t('processing.finish')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <span>Production Target: 5,000 kg/day</span>
              <div className="flex items-center gap-3">
                <span className="text-primary">0% Achieved</span>
                <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="w-[0%] h-full gold-gradient" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

