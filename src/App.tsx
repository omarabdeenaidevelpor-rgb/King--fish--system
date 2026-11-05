import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from './Layout.tsx';
import { Dashboard } from './Dashboard.tsx';
import { Receiving } from './Receiving.tsx';
import { Processing } from './Processing.tsx';
import { Quality } from './Quality.tsx';
import { Inventory } from './Inventory.tsx';
import { Shipments } from './Shipments.tsx';
import { ShieldCheck, User, Building, Bell, History, Loader2, Plus } from 'lucide-react';
import { trpc } from './lib/trpc.ts';
import './i18n.ts';

import { AuthProvider, useAuth } from './AuthContext.tsx';
import { LoginView } from './LoginView.tsx';

function AppContent() {
  const { t } = useTranslation();
  const { user, token, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  // Handle auto-routing for employees on login
  React.useEffect(() => {
    if (user) {
      if (user.role === 'GENERAL_MANAGER') setActiveTab('dashboard');
      else if (user.role === 'RECEIVING_OPERATOR') setActiveTab('receiving');
      else if (user.role === 'PRODUCTION_SUPERVISOR') setActiveTab('processing');
      else if (user.role === 'QUALITY_MANAGER') setActiveTab('quality');
      else if (user.role === 'WAREHOUSE_OPERATOR') setActiveTab('inventory');
      else if (user.role === 'EXPORT_OPERATOR') setActiveTab('shipments');
    }
  }, [user]);

  if (isLoading) return null;
  if (!user && !token) return <LoginView />;
  if (token && !user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-10 text-center">
        <div className="luxury-card p-12 max-w-md space-y-6">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-slate-100 p-2">
            <img src="/public/assets/aistudio/file_0000000064608246878eeb8954a49ae3_c40bdb85.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-primary">Access Revoked</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your account is authenticated but not authorized in the King Fish registry. Please contact your General Manager to grant you access.
          </p>
          <button onClick={logout} className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'receiving': return <Receiving />;
      case 'processing': return <Processing />;
      case 'quality': return <Quality />;
      case 'inventory': return <Inventory />;
      case 'shipments': return <Shipments />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
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

function SettingsView() {
  const { data: users = [], refetch } = trpc.listUsers.useQuery();
  const createUserMutation = trpc.createUser.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreate(false);
      setNewUserData({ name: '', email: '', role: 'RECEIVING_OPERATOR', branchId: 1 });
    }
  });

  const [showCreate, setShowCreate] = React.useState(false);
  const [newUserData, setNewUserData] = React.useState({
    name: '',
    email: '',
    role: 'RECEIVING_OPERATOR' as any,
    branchId: 1 // Using numeric ID from seed
  });

  const roles: any[] = [
    { value: 'RECEIVING_OPERATOR', label: 'Receiving Operator' },
    { value: 'QUALITY_MANAGER', label: 'Quality Manager' },
    { value: 'PRODUCTION_SUPERVISOR', label: 'Production Supervisor' },
    { value: 'WAREHOUSE_OPERATOR', label: 'Warehouse Operator' },
    { value: 'EXPORT_OPERATOR', label: 'Export Operator' },
  ];

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">System Administration</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Enterprise governance and personnel security</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 gold-gradient text-primary rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-accent/20"
        >
          <User className="w-4 h-4" />
          Authorize New Staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="luxury-card overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Active Authorized Personnel
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{users.length} Records</span>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((u: any) => (
                <div key={u.id} className="p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl navy-gradient flex items-center justify-center font-black text-white shadow-md">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{u.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full text-[9px]">
                      {u.role.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-widest">BRANCH #{u.branchId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="luxury-card p-8 space-y-6">
            <h3 className="font-bold text-primary flex items-center gap-2">
              <Building className="w-4 h-4 text-accent" />
              Organizational Scope
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Primary Entity</p>
                <p className="font-bold text-primary">King Fish Port Said Co.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Branches</p>
                <p className="font-bold text-primary">2 (Egypt, Italy)</p>
              </div>
            </div>
          </div>

          <div className="luxury-card p-8 space-y-6 bg-primary text-white border-none shadow-primary/20">
            <h3 className="font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-accent" />
              Security Audit
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">System-wide event logging is active. All personnel actions are cryptographically signed.</p>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Export Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-black text-primary tracking-tight">Staff Authorization</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Issue secure access credentials</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Legal Name</label>
                <input 
                  type="text" 
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                  placeholder="e.g. Mahmoud Ahmed"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
                <input 
                  type="email" 
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  placeholder="name@kingfish.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Role</label>
                <select 
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({...newUserData, role: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none appearance-none"
                >
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowCreate(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
              >
                Discard
              </button>
              <button 
                disabled={createUserMutation.isPending}
                onClick={() => {
                  createUserMutation.mutate(newUserData);
                }}
                className="flex-2 py-4 gold-gradient text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
              >
                {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authorize Personnel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
