import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Warehouse, 
  Move, 
  Map as MapIcon, 
  Thermometer, 
  Box,
  ChevronRight,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { cn } from './lib/utils';
import { trpc } from './lib/trpc.ts';

export const Inventory = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const { data: locations = [], isLoading } = trpc.listLocations.useQuery();
  const { data: lots = [] } = trpc.listLots.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('inventory.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time stock levels and cold store management</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Move className="w-4 h-4" />
            {t('inventory.move')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center luxury-card animate-pulse">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Inventory Sync Active...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="col-span-full py-20 text-center luxury-card">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No Storage Locations Registered</p>
          </div>
        ) : (
          locations.map((loc) => (
            <div key={loc.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all group cursor-pointer">
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                      <Warehouse className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-none">{loc.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">ID: {loc.id}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-mono font-bold",
                    (loc.targetTemp || 0) < 0 ? "text-indigo-600" : "text-amber-600"
                  )}>
                    <Thermometer className="w-3 h-3" />
                    {loc.targetTemp || 0}°C
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Utilization</span>
                    <span className="font-bold text-slate-900">{loc.capacityPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        (loc.capacityPercent || 0) > 80 ? "bg-rose-500" : (loc.capacityPercent || 0) > 50 ? "bg-amber-500" : "bg-emerald-500"
                      )} 
                      style={{ width: `${loc.capacityPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900">Registered Zone</span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors", isRtl && "rotate-180")} />
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.type}</span>
                <span className="text-[10px] font-bold text-emerald-600">Active Monitoring</span>
              </div>
            </div>
          ))
        )}

        {/* Add New Location Slot */}
        <button className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all gap-3 bg-white/50">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold">Register New Rack</span>
        </button>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm">Detailed Stock Levels</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find Item..."
                className="pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={cn("w-full text-sm", isRtl ? "text-right" : "text-left")}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Lot ID</th>
                <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Stock (kg)</th>
                <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Temperature</th>
                <th className="px-6 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-bold uppercase tracking-widest">No stock records found</td></tr>
              ) : (
                lots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{lot.lotId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{lot.status}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{lot.weight.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-indigo-600">{lot.temperature}°C</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(lot.receivedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
