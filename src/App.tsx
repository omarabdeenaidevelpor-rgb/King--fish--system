import React from 'react';
import { Building, History, Loader2, ShieldCheck, User } from 'lucide-react';
import { Layout } from './Layout.tsx';
import { Dashboard } from './Dashboard.tsx';
import { Receiving } from './Receiving.tsx';
import { Processing } from './Processing.tsx';
import { Quality } from './Quality.tsx';
import { Inventory } from './Inventory.tsx';
import { Shipments } from './Shipments.tsx';
import { trpc } from './lib/trpc.ts';
import './i18n.ts';
import { AuthProvider, useAuth } from './AuthContext.tsx';
import { LoginView } from './LoginView.tsx';

const ROLE_TABS: Record<string, string> = {
  GENERAL_MANAGER: 'dashboard',
  RECEIVING_OPERATOR: 'receiving',
  PRODUCTION_SUPERVISOR: 'processing',
  QUALITY_MANAGER: 'quality',
  WAREHOUSE_OPERATOR: 'inventory',
  EXPORT_OPERATOR: 'shipments',
};

function AppContent() {
  const { user, token, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  React.useEffect(() => {
    if (user) setActiveTab(ROLE_TABS[user.role] ?? 'dashboard');
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }
  if (!user && !token) return <LoginView />;

  if (token && !user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6 text-center">
        <div className="luxury-card p-10 max-w-md space-y-6">
          <img
            src="/assets/aistudio/file_0000000064608246878eeb8954a49ae3_c40bdb85.png"
            alt="King Fish logo"
            className="w-24 h-24 object-contain mx-auto bg-white rounded-3xl p-2"
          />
          <h2 className="text-2xl font-black text-primary">Access Revoked</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your account is authenticated but is not authorized in the King Fish registry. Please contact your General Manager.
          </p>
          <button onClick={logout} className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'receiving': return <Receiving />;
      case 'processing': return <Processing />;
      case 'quality': return <Quality />;
      case 'inventory': return <Inventory />;
      case 'shipments': return <Shipments />;
      case 'settings': return <SettingsView />;
      case 'dashboard':
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">{renderContent()}</div>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

type StaffRole =
  | 'RECEIVING_OPERATOR'
  | 'QUALITY_MANAGER'
  | 'PRODUCTION_SUPERVISOR'
  | 'WAREHOUSE_OPERATOR'
  | 'EXPORT_OPERATOR';

type NewUserData = {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  branchId: number;
};

const STAFF_ROLES: { value: StaffRole; label: string }[] = [
  { value: 'RECEIVING_OPERATOR', label: 'Receiving Operator' },
  { value: 'QUALITY_MANAGER', label: 'Quality Manager' },
  { value: 'PRODUCTION_SUPERVISOR', label: 'Production Supervisor' },
  { value: 'WAREHOUSE_OPERATOR', label: 'Warehouse Operator' },
  { value: 'EXPORT_OPERATOR', label: 'Export Operator' },
];

const EMPTY_USER: NewUserData = {
  name: '',
  email: '',
  password: '',
  role: 'RECEIVING_OPERATOR',
  branchId: 1,
};

function SettingsView() {
  const [showCreate, setShowCreate] = React.useState(false);
  const [newUserData, setNewUserData] = React.useState<NewUserData>({ ...EMPTY_USER });
  const { data: users = [], isLoading, error, refetch } = trpc.listUsers.useQuery();
  const createUserMutation = trpc.createUser.useMutation({
    onSuccess: async () => {
      await refetch();
      setShowCreate(false);
      setNewUserData({ ...EMPTY_USER });
    },
  });

  const updateField = <K extends keyof NewUserData>(field: K, value: NewUserData[K]) => {
    setNewUserData((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">System Administration</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Enterprise governance and personnel security</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 gold-gradient text-primary rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-accent/20"
        >
          <User className="w-4 h-4" /> Authorize New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="luxury-card overflow-hidden lg:col-span-2" aria-labelledby="personnel-heading">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h2 id="personnel-heading" className="font-bold text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" /> Active Authorized Personnel
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{users.length} Records</span>
          </div>
          {isLoading ? (
            <div className="p-8 flex justify-center" role="status"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : error ? (
            <p className="p-6 text-sm text-rose-600" role="alert">Could not load personnel: {error.message}</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No personnel have been authorized yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((staff) => (
                <li key={staff.id} className="p-6 flex items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-2xl navy-gradient flex items-center justify-center font-black text-white shadow-md">
                      {(staff.name ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary truncate">{staff.name}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{staff.email}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-3 py-1 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest rounded-full">
                      {staff.role.replaceAll('_', ' ')}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Branch #{staff.branchId}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section className="luxury-card p-8 space-y-6">
            <h2 className="font-bold text-primary flex items-center gap-2"><Building className="w-4 h-4 text-accent" /> Organizational Scope</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Entity</p>
                <p className="font-bold text-primary">King Fish Port Said Co.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Branches</p>
                <p className="font-bold text-primary">2 (Egypt, Italy)</p>
              </div>
            </div>
          </section>
          <section className="luxury-card p-8 space-y-6 bg-primary text-white border-none shadow-primary/20">
            <h2 className="font-bold flex items-center gap-2"><History className="w-4 h-4 text-accent" /> Security Audit</h2>
            <p className="text-xs text-slate-300 leading-relaxed">System-wide event logging is active. All personnel actions are recorded.</p>
            <button type="button" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Export Audit Trail
            </button>
          </section>
        </aside>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm" role="presentation">
          <section className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 space-y-6" role="dialog" aria-modal="true" aria-labelledby="create-user-heading">
            <div className="text-center">
              <h2 id="create-user-heading" className="text-2xl font-black text-primary tracking-tight">Staff Authorization</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Issue secure access credentials</p>
            </div>
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); createUserMutation.mutate(newUserData); }}>
              <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Legal Name</span>
                <input required type="text" autoComplete="name" value={newUserData.name} onChange={(event) => updateField('name', event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institutional Email</span>
                <input required type="email" autoComplete="email" value={newUserData.email} onChange={(event) => updateField('email', event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Login Password (minimum 4 characters)</span>
                <input required minLength={4} type="password" autoComplete="new-password" value={newUserData.password} onChange={(event) => updateField('password', event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Operational Role</span>
                <select value={newUserData.role} onChange={(event) => updateField('role', event.target.value as StaffRole)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none font-semibold text-primary">
                  {STAFF_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </label>
              {createUserMutation.error && <p className="text-xs text-rose-600 font-bold text-center" role="alert">{createUserMutation.error.message}</p>}
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Cancel</button>
                <button type="submit" disabled={createUserMutation.isPending || !newUserData.name.trim() || !newUserData.email.trim() || newUserData.password.length < 4} className="flex-1 py-4 gold-gradient text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50">
                  {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authorize Personnel'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
