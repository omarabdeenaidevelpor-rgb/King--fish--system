import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Thermometer,
  Beaker,
  FileText,
  Search
} from 'lucide-react';
import { cn } from './lib/utils';
import { trpc } from './lib/trpc.ts';
import { FileUploader } from './components/FileUploader.tsx';

const ccpPoints = [
  { name: 'CCP-01: Receiving Temp', limit: '< 4°C', current: '2.1°C', status: 'PASS' },
  { name: 'CCP-02: Cold Store 1', limit: '< -18°C', current: '-18.5°C', status: 'PASS' },
  { name: 'CCP-03: Metal Detection', limit: '0.0mm', current: '0.0mm', status: 'PASS' },
];

export const Quality = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const { data: inspections = [], isLoading } = trpc.listInspections.useQuery();

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t('quality.title')}</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">HACCP compliance and lot release control</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-xl shadow-rose-200">
            <AlertOctagon className="w-4 h-4" />
            Report Non-Conformance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* CCP Monitoring */}
        <div className="lg:col-span-1 space-y-10">
          <div className="luxury-card p-8 space-y-6">
            <h3 className="font-bold text-primary flex items-center gap-3 text-lg">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Critical Control Points
            </h3>
            <div className="space-y-4">
              {ccpPoints.map((ccp) => (
                <div key={ccp.name} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                  <div>
                     <p className="text-xs font-black text-primary uppercase tracking-wider">{ccp.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Limit: {ccp.limit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-black text-emerald-600">{ccp.current}</p>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">PASS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="luxury-card p-8 space-y-6">
             <h3 className="font-bold text-primary flex items-center gap-3 text-lg">
              <Beaker className="w-5 h-5 text-indigo-500" />
              Lab Evidence
            </h3>
            <FileUploader label="Upload Analysis Report (PDF)" />
          </div>

          <div className="navy-gradient p-8 rounded-[32px] text-white space-y-6 shadow-2xl shadow-primary/20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                HACCP Plan v2.4
              </h3>
              <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded-full uppercase">Active</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium text-center">Protocol strictly enforced since Jan 2024. Regular internal audit mandatory every 30 days.</p>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              View Detailed Log
            </button>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm">Recent Inspections</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find Lot..."
                className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className={cn("w-full text-sm", isRtl ? "text-right" : "text-left")}>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Lot ID</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Test Type</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Parameter</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Records...</td></tr>
                ) : inspections.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold uppercase tracking-widest">No Inspections Recorded</td></tr>
                ) : (
                  inspections.map((qc) => (
                    <tr key={qc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{qc.lotId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {qc.type === 'Sensory' ? <Thermometer className="w-4 h-4 text-amber-500" /> : <Beaker className="w-4 h-4 text-indigo-500" />}
                          <span className="font-medium text-slate-600">{qc.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{qc.parameter}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          qc.status === 'PENDING' ? "bg-amber-50 text-amber-700 border border-amber-100" : 
                          qc.status === 'PASS' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          "bg-rose-50 text-rose-700 border border-rose-100"
                        )}>
                          {qc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{qc.value || '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
