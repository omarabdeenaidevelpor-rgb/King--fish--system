import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowDownToLine,
  ChevronRight,
  ClipboardCheck,
  History,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';
import { trpc } from './lib/trpc.ts';


import { FileUploader } from './components/FileUploader.tsx';

export const Receiving = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const { data: suppliersData = [] } = trpc.listSuppliers.useQuery();
  const { data: lotsData = [], refetch } = trpc.listLots.useQuery();
  
  const createLotMutation = trpc.createLot.useMutation({
    onSuccess: () => refetch()
  });

  const [form, setForm] = React.useState({
    supplierId: '',
    weight: '',
    temp: '',
    vesselName: ''
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">{t('receiving.title')}</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium italic">Global raw material intake and traceability desk</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 navy-gradient text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all group">
          <Plus className="w-4 h-4 text-accent transition-transform group-hover:rotate-90" />
          <span>New Delivery Intake</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Entry Form */}
        <div className="lg:col-span-1 luxury-card p-8 space-y-8 h-fit">
          <h3 className="font-bold text-primary flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-accent" />
            </div>
            Intake Registration
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {t('receiving.supplier')}
              </label>
              <select 
                value={form.supplierId}
                onChange={(e) => setForm({...form, supplierId: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none transition-all appearance-none"
              >
                <option value="">Select Partner</option>
                {suppliersData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {t('receiving.weight')}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={form.weight}
                    onChange={(e) => setForm({...form, weight: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">KG</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {t('receiving.temp')}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={form.temp}
                    onChange={(e) => setForm({...form, temp: e.target.value})}
                    placeholder="-2.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">°C</span>
                </div>
              </div>
            </div>
            
            <FileUploader label="Supplier Certificate (PDF/Excel)" />

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Vessel / Logistics ID
              </label>
              <input 
                type="text" 
                value={form.vesselName}
                onChange={(e) => setForm({...form, vesselName: e.target.value})}
                placeholder="SHIP-ID / TRUCK-REF"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            <div className="pt-4">
              <button 
                disabled={createLotMutation.isPending}
                onClick={() => {
                  createLotMutation.mutate({
                    lotId: `KF-PSD-${Date.now().toString().slice(-6)}`,
                    supplierId: parseInt(form.supplierId),
                    weight: parseFloat(form.weight),
                    temperature: parseFloat(form.temp),
                    vesselName: form.vesselName,
                    sourceType: 'Sea'
                  });
                }}
                className="w-full py-4 gold-gradient text-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {createLotMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate & Generate Lot'}
              </button>
            </div>
          </div>
        </div>

        {/* Lots List */}
        <div className="lg:col-span-2 luxury-card overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-6 bg-slate-50/30">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search premium intake logs..."
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm"
              />
            </div>
            <button className="p-3 border border-slate-200 rounded-xl text-slate-400 hover:bg-white hover:text-primary transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className={cn("w-full text-sm", isRtl ? "text-right" : "text-left")}>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Lot Reference</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Net Mass</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Core Temp</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Status</th>
                  <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lotsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      No Records Available
                    </td>
                  </tr>
                ) : lotsData.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-mono font-bold text-primary group-hover:text-accent transition-colors">{lot.lotId}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                        <History className="w-3 h-3 text-accent" />
                        {new Date(lot.receivedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono tabular-nums text-primary font-black text-base">{lot.weight.toLocaleString()}</span>
                      <span className="text-slate-400 ml-1.5 text-[10px] font-bold uppercase">kg</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "font-mono tabular-nums font-black text-base",
                        (lot.temperature || 0) > -1 ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {lot.temperature?.toFixed(1) || '--'}°C
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        lot.status === 'ACCEPTED' && "bg-emerald-50 text-emerald-700",
                        lot.status === 'PENDING' && "bg-amber-50 text-amber-700",
                        lot.status === 'REJECTED' && "bg-rose-50 text-rose-700",
                      )}>
                        {lot.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-md rounded-lg transition-all text-slate-400 hover:text-primary">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
