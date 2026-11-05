import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  ArrowDownToLine,
  ShieldCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { trpc } from './lib/trpc.ts';

const data = [
  { time: '08:00', temp: -18.2, humidity: 45 },
  { time: '10:00', temp: -18.5, humidity: 42 },
  { time: '12:00', temp: -17.8, humidity: 48 },
  { time: '14:00', temp: -18.1, humidity: 44 },
  { time: '16:00', temp: -18.4, humidity: 41 },
  { time: '18:00', temp: -18.0, humidity: 46 },
];

const StatCard = ({ title, value, trend, trendType, icon: Icon, loading }: any) => (
  <div className="luxury-card p-8 group hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:gold-gradient transition-all duration-500">
        <Icon className="w-6 h-6 text-primary group-hover:text-white" />
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${trendType === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
        {trendType === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {trend}
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">{title}</h3>
      {loading ? (
        <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-primary font-mono tabular-nums">{value}</p>
      )}
    </div>
  </div>
);

export const Dashboard = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading } = trpc.getDashboardStats.useQuery();

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="Total Intake"
          value={`${(stats?.totalWeight || 0).toLocaleString()} kg`}
          trend="Real-time"
          trendType="up"
          icon={ArrowDownToLine}
          loading={isLoading}
        />
        <StatCard
          title="Authorized Lots"
          value={stats?.totalLots || 0}
          trend="Secured"
          trendType="up"
          icon={Package}
          loading={isLoading}
        />
        <StatCard
          title="Active Exports"
          value={stats?.activeExports || 0}
          trend="In Transit"
          trendType="up"
          icon={Activity}
          loading={isLoading}
        />
        <StatCard
          title="Quality Alerts"
          value={stats?.qualityAlerts || 0}
          trend={stats?.qualityAlerts === 0 ? "Nominal" : "Warning"}
          trendType={stats?.qualityAlerts === 0 ? "up" : "down"}
          icon={ShieldCheck}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 luxury-card p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.06] grayscale brightness-0 pointer-events-none">
             <img src="/public/assets/aistudio/file_0000000064608246878eeb8954a49ae3_c40bdb85.png" alt="" className="w-72 h-72 object-contain" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="font-bold text-xl text-primary tracking-tight font-display italic uppercase">Cold Store 01</h3>
              <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">Thermal Integrity Monitoring</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-[0.2em] bg-accent/5 px-4 py-1.5 rounded-full border border-accent/10">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                Registry Live
              </span>
            </div>
          </div>
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                  unit="°C"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A192F',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
                  }}
                  itemStyle={{ color: '#C5A059' }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#C5A059"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="luxury-card p-8 space-y-8">
          <h3 className="font-black text-xl text-primary tracking-tighter uppercase italic">Security Center</h3>
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 opacity-40">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System Secure · Zero Anomalies</p>
            </div>
          </div>
          <button className="w-full py-4 text-[10px] font-black text-primary border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-[0.2em]">
            Export System Health
          </button>
        </div>
      </div>
    </div>
  );
};

