import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  PackageCheck, 
  FileText, 
  MapPin, 
  ExternalLink,
  ChevronDown,
  Anchor,
  Globe
} from 'lucide-react';
import { cn } from './lib/utils';
import { trpc } from './lib/trpc.ts';
import { FileUploader } from './components/FileUploader.tsx';

export const Shipments = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const { data: shipments = [], isLoading } = trpc.listShipments.useQuery();
  const { data: stats } = trpc.getDashboardStats.useQuery();

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">{t('shipments.title')}</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Export logistics and customer documentation</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 navy-gradient text-white rounded-xl text-sm font-bold hover:shadow-xl hover:shadow-primary/20 transition-all">
          <Truck className="w-4 h-4 text-accent" />
          Create Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* KPI Row */}
        <div className="lg:col-span-1 luxury-card p-8 flex items-center gap-6 group hover:gold-gradient transition-all duration-500">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white/60">Active Exports</p>
            <p className="text-2xl font-black text-primary group-hover:text-white">{stats?.activeExports || 0}</p>
          </div>
        </div>
        <div className="lg:col-span-1 luxury-card p-8 flex items-center gap-6 group hover:gold-gradient transition-all duration-500">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-white/20 group-hover:text-white transition-colors">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white/60">Total Value Units</p>
            <p className="text-2xl font-black text-primary group-hover:text-white">{shipments.length}</p>
          </div>
        </div>
        
        <div className="lg:col-span-2 luxury-card p-6 flex flex-col justify-center gap-2">
          <FileUploader label="Instant Export Documents (PDF/XLS)" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
             <div className="text-center py-20 luxury-card">
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] animate-pulse">Synchronizing Logistics...</p>
            </div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-20 luxury-card">
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em]">No Active Shipments Found</p>
            </div>
          ) : (
            shipments.map((shp) => (
              <div key={shp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
                        <Truck className="w-6 h-6 text-slate-900" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{shp.shipmentNumber}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            shp.status === 'IN_TRANSIT' ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          )}>
                            {shp.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">{shp.customerName}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {shp.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Anchor className="w-3 h-3" />
                            Port: {shp.portOfLoading}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Evidence Pack</p>
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          <FileText className="w-4 h-4" />
                          Download PDF
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <button className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                        Manage Shipment
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
                    <span>Created: {new Date(shp.createdAt).toLocaleDateString()}</span>
                    <span>Vessel: {shp.vesselName || 'TBA'}</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
