/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Gym,
  Client,
  Plan,
  ClassSession,
  ProductInventory,
  BackupFile,
  LogEntry,
  ServerMetrics,
} from './types';
import {
  mockPlanes,
  mockGyms,
  mockClients,
  mockClasses,
  mockProducts,
  initialBackups,
  initialLogs,
  generateMetrics,
  formatTime,
} from './utils';

import DashboardOverview from './components/DashboardOverview';
import GymSaaSManager from './components/GymSaaSManager';
import PHPDeployer from './components/PHPDeployer';
import RealTimeMonitor from './components/RealTimeMonitor';
import ManualInstallGuide from './components/ManualInstallGuide';
import SuperAdminConsole from './components/SuperAdminConsole';
import SocioPortal from './components/SocioPortal';

import {
  LayoutDashboard,
  Users,
  Code2,
  Activity,
  Compass,
  FolderOpen,
  HelpCircle,
  Menu,
  X,
  Database,
  ShieldAlert,
  User,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // SaaS relational data states
  const [gyms, setGyms] = useState<Gym[]>(mockGyms);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [products, setProducts] = useState<ProductInventory[]>(mockProducts);
  const [planes] = useState<Plan[]>(mockPlanes);
  const [classes, setClasses] = useState<ClassSession[]>(mockClasses);

  // Monitoring States
  const [backups, setBackups] = useState<BackupFile[]>(initialBackups);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics>(generateMetrics());

  // Workspace configuration states
  const [activeGymId, setActiveGymId] = useState<number>(1);
  const [currentRole, setCurrentRole] = useState<'super_admin' | 'gym_admin' | 'client'>('gym_admin');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic slow-polling logs simulation for resource counters
  useEffect(() => {
    const handleInterval = setInterval(() => {
      setServerMetrics(generateMetrics());
    }, 6000);

    return () => clearInterval(handleInterval);
  }, []);

  // System Logging helper controller
  const handleLogAdd = (
    service: 'Database' | 'Backup' | 'API' | 'Auth' | 'Security',
    level: 'info' | 'warn' | 'error' | 'success',
    message: string
  ) => {
    const timestamp = formatTime(new Date());
    const newEntry: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      level,
      service,
      message,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  // Role transition handler
  const handleRoleChange = (role: 'super_admin' | 'gym_admin' | 'client') => {
    setCurrentRole(role);
    if (role === 'super_admin') {
      setActiveTab('super_console');
      handleLogAdd('Auth', 'info', 'SESIÓN CAMBIADA: Conectado con rol maestro Super Administrador.');
    } else if (role === 'gym_admin') {
      setActiveTab('overview');
      handleLogAdd('Auth', 'info', 'SESIÓN CAMBIADA: Conectado con rol Administrador de Sede.');
    } else {
      setActiveTab('socio_portal');
      handleLogAdd('Auth', 'info', 'SESIÓN CAMBIADA: Conectado con perfil interactivo Socio de Gimnasio.');
    }
  };

  // CRUD operation handlers
  const handleAddClient = (newClient: Omit<Client, 'id' | 'qrCode'>) => {
    const clientId = clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1;
    const clientEntity: Client = {
      ...newClient,
      id: clientId,
      qrCode: `CLIENT_QR_${clientId}`,
    };

    setClients((prev) => [...prev, clientEntity]);
    handleLogAdd(
      'Database',
      'success',
      `PDO SELECT/INSERT: Inscripto nuevo socio '${clientEntity.name}' en tabla \`clientes\` para Gym ID: ${clientEntity.gymId}`
    );
  };

  const handleEditClient = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    handleLogAdd(
      'Database',
      'success',
      `PDO UPDATE: Se actualizaron datos biométricos e IMC para el socio ID: ${updatedClient.id}`
    );
  };

  const handleDeleteClient = (id: number) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (client) {
      handleLogAdd(
        'Database',
        'warn',
        `PDO DELETE: Eliminado el cliente '${client.name}' (ID: ${id}) del tenant asignado.`
      );
    }
  };

  // Gym/Sede CRUD operators (for Super Admin)
  const handleAddGym = (newGym: Omit<Gym, 'id' | 'createdAt'>) => {
    const gymId = gyms.length > 0 ? Math.max(...gyms.map((g) => g.id)) + 1 : 1;
    const dateStr = new Date().toISOString().split('T')[0];
    const gymEntity: Gym = {
      ...newGym,
      id: gymId,
      createdAt: dateStr,
    };
    setGyms((prev) => [...prev, gymEntity]);
  };

  const handleUpdateGymStatus = (id: number, status: 'Activo' | 'Suspendido') => {
    setGyms((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status } : g))
    );
  };

  const handleUpdateGymPlan = (id: number, planType: 'Básico' | 'Profesional' | 'Enterprise') => {
    setGyms((prev) =>
      prev.map((g) => (g.id === id ? { ...g, planType } : g))
    );
  };

  const handleDeleteGym = (id: number) => {
    setGyms((prev) => prev.filter((g) => g.id !== id));
    // Filter active gym if deleted
    if (activeGymId === id) {
      const remaining = gyms.filter((g) => g.id !== id);
      if (remaining.length > 0) {
        setActiveGymId(remaining[0].id);
      }
    }
  };

  // Socio/Client Portal activities
  const handleBookClass = (classId: number) => {
    setClasses((prev) =>
      prev.map((cl) => {
         if (cl.id === classId) {
           return {
             ...cl,
             currentReservations: Math.min(cl.currentReservations + 1, cl.maxCapacity),
           };
         }
         return cl;
      })
    );
  };

  const handleCancelBooking = (classId: number) => {
    setClasses((prev) =>
      prev.map((cl) => {
         if (cl.id === classId) {
           return {
             ...cl,
             currentReservations: Math.max(cl.currentReservations - 1, 0),
           };
         }
         return cl;
      })
    );
  };

  const handleBuyProduct = (productId: number) => {
    setProducts((prev) =>
      prev.map((p) => {
         if (p.id === productId) {
           return {
             ...p,
             stock: Math.max(p.stock - 1, 0),
           };
         }
         return p;
      })
    );
  };

  const handleUpdateClientBiometrics = (clientId: number, weight: number, height: number) => {
    setClients((prev) =>
      prev.map((c) => {
         if (c.id === clientId) {
           const rawIMC = weight / ((height / 100) * (height / 100));
           const imcValue = parseFloat(rawIMC.toFixed(2));
           return {
             ...c,
             weight,
             height,
             imc: imcValue,
           };
         }
         return c;
      })
    );
  };

  const handleExecuteBackup = (newBackup: BackupFile) => {
    setBackups((prev) => [newBackup, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100" id="main_saas_dashboard_root">
      {/* SIDEBAR NAVIGATION - DESKTOP VIEW */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800" id="desktop_sidebar">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3 bg-slate-950/20">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
            <Database size={16} />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">GymAdmin SaaS</span>
            <span className="text-[10px] text-slate-500 font-mono">PHP & MySQL Stack</span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="px-4 py-4 border-b border-slate-800 space-y-2.5 bg-slate-950/40">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block pl-1">
            Perfil de Conexión
          </label>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleRoleChange('super_admin')}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                currentRole === 'super_admin'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield size={12} />
                <span>Super Admin</span>
              </span>
              {currentRole === 'super_admin' && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>}
            </button>

            <button
              onClick={() => handleRoleChange('gym_admin')}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                currentRole === 'gym_admin'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Database size={12} />
                <span>Admin de Sede</span>
              </span>
              {currentRole === 'gym_admin' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>}
            </button>

            <button
              onClick={() => handleRoleChange('client')}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-between cursor-pointer ${
                currentRole === 'client'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <User size={12} />
                <span>Socio / Cliente</span>
              </span>
              {currentRole === 'client' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>}
            </button>
          </div>
        </div>

        {/* Navigation Elements */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {currentRole === 'super_admin' && (
            <>
              <button
                onClick={() => setActiveTab('super_console')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'super_console'
                    ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <Compass size={15} />
                <span>Consola Global</span>
              </button>

              <button
                onClick={() => setActiveTab('deploy')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'deploy'
                    ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <Code2 size={15} />
                <span>Respaldar y Códigos PHP</span>
              </button>

              <button
                onClick={() => setActiveTab('monitor')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'monitor'
                    ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <Activity size={15} />
                <span>Servidor Realtime Monitor</span>
              </button>
            </>
          )}

          {currentRole === 'gym_admin' && (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <LayoutDashboard size={15} />
                <span>Consola General</span>
              </button>

              <button
                onClick={() => setActiveTab('saas')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'saas'
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <Users size={15} />
                <span>Módulos del SaaS</span>
              </button>

              <button
                onClick={() => setActiveTab('deploy')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'deploy'
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <Code2 size={15} />
                <span>Respaldar y Códigos PHP</span>
              </button>

              <button
                onClick={() => setActiveTab('monitor')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'monitor'
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <Activity size={15} />
                <span>Servidor Realtime Monitor</span>
              </button>
            </>
          )}

          {currentRole === 'client' && (
            <>
              <button
                onClick={() => setActiveTab('socio_portal')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'socio_portal'
                    ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <User size={15} />
                <span>Mi Portal de Socio</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('guide')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'guide'
                ? currentRole === 'super_admin'
                  ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20'
                  : currentRole === 'client'
                  ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
            }`}
          >
            <FolderOpen size={15} />
            <span>Manual de Instalación</span>
          </button>
        </nav>

        {/* Footer Security status logo */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-[10px] space-y-1">
          <p className="font-mono text-slate-500">PDO-Connection Shield</p>
          <p className="text-emerald-400 font-bold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
            ACTIVO & PROTEGIDO
          </p>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER MODULES */}
      <div className="flex-1 flex flex-col min-w-0" id="workspace_viewport">
        <header className="lg:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40 sticky top-0">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">🏋️</span>
            <span className="font-bold text-sm tracking-tight text-white block">GymAdmin PHP</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-slate-850 text-slate-300 rounded hover:text-white transition focus:outline-none"
            id="mobile_hamburger_toggle"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {/* Mobile Navigation overlay drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden bg-slate-900 border-b border-slate-800 p-6 space-y-4 z-30 sticky top-16"
              id="mobile_drawer_navigation"
            >
              {/* Mobile Role Switching Grid */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 tracking-wider font-mono font-bold block pb-1">ROL DIRECTO:</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  <button
                    onClick={() => { handleRoleChange('super_admin'); setMobileMenuOpen(false); }}
                    className={`py-1.5 px-1 rounded-lg text-center border ${
                      currentRole === 'super_admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-slate-400 border-transparent'
                    }`}
                  >
                    Super Admin
                  </button>
                  <button
                    onClick={() => { handleRoleChange('gym_admin'); setMobileMenuOpen(false); }}
                    className={`py-1.5 px-1 rounded-lg text-center border ${
                      currentRole === 'gym_admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'text-slate-400 border-transparent'
                    }`}
                  >
                    Admin Sede
                  </button>
                  <button
                    onClick={() => { handleRoleChange('client'); setMobileMenuOpen(false); }}
                    className={`py-1.5 px-1 rounded-lg text-center border ${
                      currentRole === 'client' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'text-slate-400 border-transparent'
                    }`}
                  >
                    Socio
                  </button>
                </div>
              </div>

              {/* Mobile Tabs Grid */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 tracking-wider font-mono font-bold block pb-1">MÓDULOS DEL ROL:</span>
                {currentRole === 'super_admin' && (
                  <>
                    {[
                      { tab: 'super_console', text: 'Consola Global', icon: <Compass size={14} /> },
                      { tab: 'deploy', text: 'Respaldar y Códigos PHP', icon: <Code2 size={14} /> },
                      { tab: 'monitor', text: 'Servidor Monitor', icon: <Activity size={14} /> },
                      { tab: 'guide', text: 'Manual de Instalación', icon: <FolderOpen size={14} /> },
                    ].map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => {
                          setActiveTab(item.tab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-xs font-semibold ${
                          activeTab === item.tab ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </>
                )}

                {currentRole === 'gym_admin' && (
                  <>
                    {[
                      { tab: 'overview', text: 'Consola General', icon: <LayoutDashboard size={14} /> },
                      { tab: 'saas', text: 'Módulos del SaaS', icon: <Users size={14} /> },
                      { tab: 'deploy', text: 'Respaldar y Códigos PHP', icon: <Code2 size={14} /> },
                      { tab: 'monitor', text: 'Servidor Monitor', icon: <Activity size={14} /> },
                      { tab: 'guide', text: 'Manual de Instalación', icon: <FolderOpen size={14} /> },
                    ].map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => {
                          setActiveTab(item.tab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-xs font-semibold ${
                          activeTab === item.tab ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </>
                )}

                {currentRole === 'client' && (
                  <>
                    {[
                      { tab: 'socio_portal', text: 'Mi Portal de Socio', icon: <User size={14} /> },
                      { tab: 'guide', text: 'Manual de Instalación', icon: <FolderOpen size={14} /> },
                    ].map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => {
                          setActiveTab(item.tab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-xs font-semibold ${
                          activeTab === item.tab ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {item.icon}
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN VISUAL LAYOUT WORKSPACE */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto" id="main_content_canvas">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'super_console' && (
                <SuperAdminConsole
                  gyms={gyms}
                  clients={clients}
                  planes={planes}
                  onAddGym={handleAddGym}
                  onUpdateGymStatus={handleUpdateGymStatus}
                  onUpdateGymPlan={handleUpdateGymPlan}
                  onDeleteGym={handleDeleteGym}
                  onLogAdd={handleLogAdd}
                />
              )}

              {activeTab === 'socio_portal' && (
                <SocioPortal
                  gyms={gyms}
                  clients={clients}
                  planes={planes}
                  classes={classes}
                  products={products}
                  onBookClass={handleBookClass}
                  onCancelBooking={handleCancelBooking}
                  onBuyProduct={handleBuyProduct}
                  onUpdateClientBiometrics={handleUpdateClientBiometrics}
                  onLogAdd={handleLogAdd}
                />
              )}

              {activeTab === 'overview' && (
                <DashboardOverview
                  gyms={gyms}
                  clients={clients}
                  products={products}
                  planes={planes}
                  activeGymId={activeGymId}
                  setActiveGymId={setActiveGymId}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'saas' && (
                <GymSaaSManager
                  gyms={gyms}
                  clients={clients}
                  products={products}
                  planes={planes}
                  classes={classes}
                  activeGymId={activeGymId}
                  onAddClient={handleAddClient}
                  onEditClient={handleEditClient}
                  onDeleteClient={handleDeleteClient}
                />
              )}

              {activeTab === 'deploy' && (
                <PHPDeployer onLogAdd={handleLogAdd} />
              )}

              {activeTab === 'monitor' && (
                <RealTimeMonitor
                  gyms={gyms}
                  clients={clients}
                  planes={planes}
                  backups={backups}
                  logs={logs}
                  serverMetrics={serverMetrics}
                  onExecuteBackup={handleExecuteBackup}
                  onLogAdd={handleLogAdd}
                />
              )}

              {activeTab === 'guide' && (
                <ManualInstallGuide />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
