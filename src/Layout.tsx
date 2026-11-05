import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  ArrowDownToLine, 
  Settings2, 
  ShieldCheck, 
  PackageSearch, 
  Truck,
  Languages,
  LogOut,
  Warehouse,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from './lib/utils';
import { useAuth } from './AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group",
      active 
        ? "bg-white/10 text-white shadow-inner" 
        : "text-slate-300 hover:text-white hover:bg-white/5"
    )}
  >
    {active && (
      <div className="absolute inset-y-2 left-0 w-1 bg-accent rounded-r-full shadow-[0_0_10px_#C5A059] rtl:left-auto rtl:right-0 rtl:rounded-r-none rtl:rounded-l-full" />
    )}
    <Icon className={cn("w-5 h-5 shrink-0 transition-colors", active ? "text-accent" : "text-slate-400 group-hover:text-accent-light")} />
    {!collapsed && <span className="whitespace-nowrap tracking-wide">{label}</span>}
  </button>
);

export const Layout = ({ 
  children, 
  activeTab, 
  setActiveTab 
}: { 
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isRtl = i18n.dir() === 'rtl';

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : i18n.language === 'en' ? 'it' : 'ar';
    i18n.changeLanguage(next);
  };

  // Define full menu
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('app.dashboard'), roles: ['GENERAL_MANAGER'] },
    { id: 'receiving', icon: ArrowDownToLine, label: t('app.receiving'), roles: ['GENERAL_MANAGER', 'RECEIVING_OPERATOR'] },
    { id: 'processing', icon: Settings2, label: t('app.processing'), roles: ['GENERAL_MANAGER', 'PRODUCTION_SUPERVISOR'] },
    { id: 'quality', icon: ShieldCheck, label: t('app.quality'), roles: ['GENERAL_MANAGER', 'QUALITY_MANAGER'] },
    { id: 'inventory', icon: Warehouse, label: t('app.inventory'), roles: ['GENERAL_MANAGER', 'WAREHOUSE_OPERATOR'] },
    { id: 'shipments', icon: Truck, label: t('app.shipments'), roles: ['GENERAL_MANAGER', 'EXPORT_OPERATOR'] },
    { id: 'settings', icon: Settings2, label: t('app.settings'), roles: ['GENERAL_MANAGER'] },
  ];

  // Filter based on user role
  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <div className={cn("min-h-screen bg-[#F8FAFC] font-sans flex flex-col lg:flex-row text-slate-800", isRtl ? "text-right" : "text-left")} dir={i18n.dir()}>
      
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-primary/70 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-primary text-white flex flex-col h-screen fixed lg:sticky top-0 z-50 shadow-2xl transition-all duration-300 ease-in-out border-r border-white/5",
          collapsed ? "lg:w-20" : "lg:w-72",
          mobileOpen 
            ? "translate-x-0 w-72" 
            : isRtl 
              ? "translate-x-full lg:translate-x-0 w-72" 
              : "-translate-x-full lg:translate-x-0 w-72"
        )}
      >
        {/* Brand Header in Sidebar */}
        <div className="p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/15 p-1 backdrop-blur-md">
              <img 
                src="/public/assets/aistudio/file_0000000064608246878eeb8954a49ae3_c40bdb85.png" 
                alt="King Fish Logo" 
                className="w-full h-full object-contain filter drop-shadow-sm" 
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-lg tracking-tight text-white leading-tight font-display">King Fish</span>
                <span className="text-[9px] text-accent font-black uppercase tracking-[0.25em] mt-0.5">Industrial Co.</span>
              </div>
            )}
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl lg:hidden hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse toggle for desktop */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed 
              ? (isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
              : (isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)
            }
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-5 px-3 overflow-y-auto space-y-1.5">
          {filteredMenu.map(item => (
            <NavItem 
              key={item.id}
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => handleNavClick(item.id)} 
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2 shrink-0">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <Languages className="w-4 h-4 shrink-0 text-accent" />
            {!collapsed && <span>{t(`lang.${i18n.language}`, i18n.language === 'ar' ? 'العربية' : i18n.language === 'en' ? 'English' : 'Italiano')}</span>}
          </button>
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-bold text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t('app.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
          
          {/* Left: Mobile Toggle & Logo Branding */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 bg-slate-100 hover:bg-slate-200 text-primary rounded-xl transition-colors focus:ring-2 focus:ring-accent"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Prominent Logo on the Top Bar */}
            <div className="flex items-center gap-3 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-xl shadow-xs border border-slate-200 p-1 flex items-center justify-center shrink-0">
                <img 
                  src="/public/assets/aistudio/file_0000000064608246878eeb8954a49ae3_c40bdb85.png" 
                  alt="King Fish Logo" 
                  className="w-full h-full object-contain filter drop-shadow-xs" 
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-primary leading-tight font-display">King Fish</span>
                  <span className="px-2 py-0.5 bg-accent/15 text-accent text-[9px] font-black rounded-md tracking-wider uppercase">HQ</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {t(`app.${activeTab}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Active Tab & User Info */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-primary">{user?.name}</span>
              <span className="text-[10px] text-accent font-black uppercase tracking-widest">{user?.role?.replace('_', ' ')}</span>
            </div>
            
            <div className="w-10 h-10 rounded-xl navy-gradient flex items-center justify-center font-bold text-white shadow-md shadow-primary/20 uppercase text-xs">
              {user?.name?.substring(0, 2) || 'AD'}
            </div>
          </div>
        </header>

        {/* Dashboard Viewport */}
        <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
