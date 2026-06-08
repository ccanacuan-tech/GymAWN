/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Gym,
  GymAdmin,
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

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  // SaaS relational data states
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymAdmins, setGymAdmins] = useState<GymAdmin[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);

  // Monitoring States
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics>(generateMetrics());
  const [loading, setLoading] = useState(true);

  // Workspace configuration states
  const [activeGymId, setActiveGymId] = useState<number>(1);
  const [activeClientId, setActiveClientId] = useState<number>(1);
  const [currentRole, setCurrentRole] = useState<'super_admin' | 'gym_admin' | 'client'>('gym_admin');
  const [impersonatedBySuperAdmin, setImpersonatedBySuperAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic slow-polling logs simulation for resource counters
  useEffect(() => {
    const handleInterval = setInterval(() => {
      setServerMetrics(generateMetrics());
    }, 6000);

    return () => clearInterval(handleInterval);
  }, []);

  // Sync databases and seed if empty, setup real-time subscribers
  useEffect(() => {
    let active = true;

    async function syncAndSeed() {
      try {
        // Seed Gyms if empty
        const gymsCol = collection(db, 'gyms');
        const gymsSnap = await getDocs(gymsCol);
        if (gymsSnap.empty) {
          const batch = writeBatch(db);
          mockGyms.forEach((gym) => {
            batch.set(doc(db, 'gyms', gym.id.toString()), gym);
          });
          await batch.commit();
        }

        // Seed GymAdmins if empty
        const adminsCol = collection(db, 'gymAdmins');
        const adminsSnap = await getDocs(adminsCol);
        if (adminsSnap.empty) {
          const batch = writeBatch(db);
          const initialGymAdmins: GymAdmin[] = [
            {
              id: 1,
              gymId: 1,
              name: 'Carlos Sede Mega',
              email: 'carlos@megapower.fit',
              phone: '+34 600 123 456',
              status: 'Activo',
              createdAt: '2026-06-08'
            },
            {
              id: 2,
              gymId: 2,
              name: 'Sandra Zen Sede',
              email: 'sandra@yogazen.fit',
              phone: '+34 611 122 333',
              status: 'Activo',
              createdAt: '2026-06-08'
            }
          ];
          initialGymAdmins.forEach((adm) => {
            batch.set(doc(db, 'gymAdmins', adm.id.toString()), adm);
          });
          await batch.commit();
        }

        // Seed Planes if empty
        const planesCol = collection(db, 'planes');
        const planesSnap = await getDocs(planesCol);
        if (planesSnap.empty) {
          const batch = writeBatch(db);
          mockPlanes.forEach((plan) => {
            batch.set(doc(db, 'planes', plan.id.toString()), plan);
          });
          await batch.commit();
        }

        // Seed Clients if empty
        const clientsCol = collection(db, 'clients');
        const clientsSnap = await getDocs(clientsCol);
        if (clientsSnap.empty) {
          const batch = writeBatch(db);
          mockClients.forEach((client) => {
            batch.set(doc(db, 'clients', client.id.toString()), client);
          });
          await batch.commit();
        }

        // Seed Classes if empty
        const classesCol = collection(db, 'classes');
        const classesSnap = await getDocs(classesCol);
        if (classesSnap.empty) {
          const batch = writeBatch(db);
          mockClasses.forEach((cls) => {
            batch.set(doc(db, 'classes', cls.id.toString()), cls);
          });
          await batch.commit();
        }

        // Seed Products if empty
        const productsCol = collection(db, 'products');
        const productsSnap = await getDocs(productsCol);
        if (productsSnap.empty) {
          const batch = writeBatch(db);
          mockProducts.forEach((p) => {
            batch.set(doc(db, 'products', p.id.toString()), p);
          });
          await batch.commit();
        }

        // Seed Backups if empty
        const backupsCol = collection(db, 'backups');
        const backupsSnap = await getDocs(backupsCol);
        if (backupsSnap.empty) {
          const batch = writeBatch(db);
          initialBackups.forEach((b) => {
            batch.set(doc(db, 'backups', b.id), b);
          });
          await batch.commit();
        }

        // Seed Logs if empty
        const logsCol = collection(db, 'logs');
        const logsSnap = await getDocs(logsCol);
        if (logsSnap.empty) {
          const batch = writeBatch(db);
          initialLogs.forEach((l) => {
            batch.set(doc(db, 'logs', l.id), l);
          });
          await batch.commit();
        }
      } catch (err) {
        console.error('Error bootstrapping default collection state into Firestore:', err);
      }

      if (!active) return;

      // Realtime sub listeners
      const unsubGyms = onSnapshot(collection(db, 'gyms'), (snap) => {
        const list: Gym[] = [];
        snap.forEach((d) => list.push(d.data() as Gym));
        list.sort((a, b) => a.id - b.id);
        setGyms(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'gyms'));

      const unsubGymAdmins = onSnapshot(collection(db, 'gymAdmins'), (snap) => {
        const list: GymAdmin[] = [];
        snap.forEach((d) => list.push(d.data() as GymAdmin));
        list.sort((a, b) => a.id - b.id);
        setGymAdmins(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'gymAdmins'));

      const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
        const list: Client[] = [];
        snap.forEach((d) => list.push(d.data() as Client));
        list.sort((a, b) => a.id - b.id);
        setClients(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'clients'));

      const unsubPlans = onSnapshot(collection(db, 'planes'), (snap) => {
        const list: Plan[] = [];
        snap.forEach((d) => list.push(d.data() as Plan));
        list.sort((a, b) => a.id - b.id);
        setPlanes(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'planes'));

      const unsubClasses = onSnapshot(collection(db, 'classes'), (snap) => {
        const list: ClassSession[] = [];
        snap.forEach((d) => list.push(d.data() as ClassSession));
        list.sort((a, b) => a.id - b.id);
        setClasses(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'classes'));

      const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
        const list: ProductInventory[] = [];
        snap.forEach((d) => list.push(d.data() as ProductInventory));
        list.sort((a, b) => a.id - b.id);
        setProducts(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));

      const unsubBackups = onSnapshot(collection(db, 'backups'), (snap) => {
        const list: BackupFile[] = [];
        snap.forEach((d) => list.push(d.data() as BackupFile));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBackups(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'backups'));

      const unsubLogs = onSnapshot(collection(db, 'logs'), (snap) => {
        const list: LogEntry[] = [];
        snap.forEach((d) => list.push(d.data() as LogEntry));
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(list.slice(0, 100));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'logs'));

      setLoading(false);

      return () => {
        unsubGyms();
        unsubGymAdmins();
        unsubClients();
        unsubPlans();
        unsubClasses();
        unsubProducts();
        unsubBackups();
        unsubLogs();
      };
    }

    const unsubCleanupPromise = syncAndSeed();

    return () => {
      active = false;
      unsubCleanupPromise.then((cleanupFn) => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, []);

  // System Logging helper controller to cloud
  const handleLogAdd = async (
    service: 'Database' | 'Backup' | 'API' | 'Auth' | 'Security',
    level: 'info' | 'warn' | 'error' | 'success',
    message: string
  ) => {
    const timestamp = formatTime(new Date());
    const id = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newEntry: LogEntry = {
      id,
      timestamp,
      level,
      service,
      message,
    };
    try {
      await setDoc(doc(db, 'logs', id), newEntry);
    } catch (err) {
      console.error('Failed to log sync write to Firestore:', err);
    }
  };

  // Role transition handler
  const handleRoleChange = (role: 'super_admin' | 'gym_admin' | 'client') => {
    setCurrentRole(role);
    setImpersonatedBySuperAdmin(false); // Reset simulation banner if they click a role directly
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

  // Impersonate / Login-As helper functions
  const handleImpersonate = (role: 'gym_admin' | 'client', targetId: number) => {
    setCurrentRole(role);
    setImpersonatedBySuperAdmin(true);
    if (role === 'gym_admin') {
      setActiveGymId(targetId);
      setActiveTab('overview');
      handleLogAdd('Auth', 'success', `IMPERSONACIÓN: Sesión de Super Admin redirigida como administrador de Sede ID: ${targetId}`);
    } else {
      setActiveClientId(targetId);
      setActiveTab('socio_portal');
      handleLogAdd('Auth', 'success', `IMPERSONACIÓN: Sesión de Super Admin redirigida como socio del gimnasio ID: ${targetId}`);
    }
  };

  const handleStopImpersonating = () => {
    setCurrentRole('super_admin');
    setActiveTab('super_console');
    setImpersonatedBySuperAdmin(false);
    handleLogAdd('Auth', 'info', 'IMPERSONACIÓN FINALIZADA: Sesión simulada finalizada. Retorno seguro al panel maestro.');
  };

  // CRUD operation handlers
  const handleAddClient = async (newClient: Omit<Client, 'id' | 'qrCode'>) => {
    const clientId = clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1;
    const clientEntity: Client = {
      ...newClient,
      id: clientId,
      qrCode: `CLIENT_QR_${clientId}`,
    };

    try {
      await setDoc(doc(db, 'clients', clientId.toString()), clientEntity);
      handleLogAdd(
        'Database',
        'success',
        `PDO SELECT/INSERT: Inscripto nuevo socio '${clientEntity.name}' en tabla \`clientes\` para Gym ID: ${clientEntity.gymId}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clients/${clientId}`);
    }
  };

  const handleEditClient = async (updatedClient: Client) => {
    try {
      await setDoc(doc(db, 'clients', updatedClient.id.toString()), updatedClient);
      handleLogAdd(
        'Database',
        'success',
        `PDO UPDATE: Se actualizararon datos biométricos e IMC para el socio ID: ${updatedClient.id}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clients/${updatedClient.id}`);
    }
  };

  const handleDeleteClient = async (id: number) => {
    const client = clients.find((c) => c.id === id);
    try {
      await deleteDoc(doc(db, 'clients', id.toString()));
      if (client) {
        handleLogAdd(
          'Database',
          'warn',
          `PDO DELETE: Eliminado el cliente '${client.name}' (ID: ${id}) del tenant asignado.`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
    }
  };

  // GymAdmin CRUD operators (for Super Admin)
  const handleAddGymAdmin = async (newAdmin: Omit<GymAdmin, 'id' | 'createdAt'>) => {
    const adminId = gymAdmins.length > 0 ? Math.max(...gymAdmins.map((a) => a.id)) + 1 : 1;
    const dateStr = new Date().toISOString().split('T')[0];
    const adminEntity: GymAdmin = {
      ...newAdmin,
      id: adminId,
      createdAt: dateStr,
    };
    try {
      await setDoc(doc(db, 'gymAdmins', adminId.toString()), adminEntity);
      handleLogAdd(
        'Database',
        'success',
        `PDO INSERT: Se generó nueva cuenta administrador de gimnasio '${adminEntity.name}' para Sede ID: ${adminEntity.gymId}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `gymAdmins/${adminId}`);
    }
  };

  const handleEditGymAdmin = async (updatedAdmin: GymAdmin) => {
    try {
      await setDoc(doc(db, 'gymAdmins', updatedAdmin.id.toString()), updatedAdmin);
      handleLogAdd(
        'Database',
        'success',
        `PDO UPDATE: Modificación de cuenta administrador de sede '${updatedAdmin.name}' (ID: ${updatedAdmin.id})`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `gymAdmins/${updatedAdmin.id}`);
    }
  };

  const handleDeleteGymAdmin = async (id: number) => {
    const admin = gymAdmins.find((a) => a.id === id);
    try {
      await deleteDoc(doc(db, 'gymAdmins', id.toString()));
      if (admin) {
        handleLogAdd(
          'Database',
          'warn',
          `PDO DELETE: Cuenta administrador de gimnasio '${admin.name}' (ID: ${id}) eliminada permanentemente del sistema SaaS.`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gymAdmins/${id}`);
    }
  };

  // Gym/Sede CRUD operators (for Super Admin)
  const handleAddGym = async (newGym: Omit<Gym, 'id' | 'createdAt'>) => {
    const gymId = gyms.length > 0 ? Math.max(...gyms.map((g) => g.id)) + 1 : 1;
    const dateStr = new Date().toISOString().split('T')[0];
    const gymEntity: Gym = {
      ...newGym,
      id: gymId,
      createdAt: dateStr,
    };
    try {
      await setDoc(doc(db, 'gyms', gymId.toString()), gymEntity);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `gyms/${gymId}`);
    }
  };

  const handleUpdateGymStatus = async (id: number, status: 'Activo' | 'Suspendido') => {
    try {
      await updateDoc(doc(db, 'gyms', id.toString()), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `gyms/${id}`);
    }
  };

  const handleUpdateGymPlan = async (id: number, planType: 'Básico' | 'Profesional' | 'Enterprise') => {
    try {
      await updateDoc(doc(db, 'gyms', id.toString()), { planType });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `gyms/${id}`);
    }
  };

  const handleDeleteGym = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'gyms', id.toString()));
      // Filter active gym if deleted
      if (activeGymId === id) {
        const remaining = gyms.filter((g) => g.id !== id);
        if (remaining.length > 0) {
          setActiveGymId(remaining[0].id);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gyms/${id}`);
    }
  };

  // Socio/Client Portal activities
  const handleBookClass = async (classId: number) => {
    const cl = classes.find((cls) => cls.id === classId);
    if (!cl) return;
    const nextReservations = Math.min(cl.currentReservations + 1, cl.maxCapacity);
    try {
      await updateDoc(doc(db, 'classes', classId.toString()), {
        currentReservations: nextReservations,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `classes/${classId}`);
    }
  };

  const handleCancelBooking = async (classId: number) => {
    const cl = classes.find((cls) => cls.id === classId);
    if (!cl) return;
    const nextReservations = Math.max(cl.currentReservations - 1, 0);
    try {
      await updateDoc(doc(db, 'classes', classId.toString()), {
        currentReservations: nextReservations,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `classes/${classId}`);
    }
  };

  const handleBuyProduct = async (productId: number) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const nextStock = Math.max(p.stock - 1, 0);
    try {
      await updateDoc(doc(db, 'products', productId.toString()), {
        stock: nextStock,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    }
  };

  const handleUpdateClientBiometrics = async (clientId: number, weight: number, height: number) => {
    const c = clients.find((client) => client.id === clientId);
    if (!c) return;
    const rawIMC = weight / ((height / 100) * (height / 100));
    const imcValue = parseFloat(rawIMC.toFixed(2));
    try {
      await updateDoc(doc(db, 'clients', clientId.toString()), {
        weight,
        height,
        imc: imcValue,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clients/${clientId}`);
    }
  };

  const handleExecuteBackup = async (newBackup: BackupFile) => {
    try {
      await setDoc(doc(db, 'backups', newBackup.id), newBackup);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `backups/${newBackup.id}`);
    }
  };

  if (loading || gyms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6" id="dashboard_loading_screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4" id="loading_spinner"></div>
        <p className="text-sm font-medium tracking-wide text-zinc-400" id="loading_message">
          Estableciendo enlace de base de datos distribuidos en Firebase...
        </p>
      </div>
    );
  }

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
        {/* Impersonation Banner */}
        {impersonatedBySuperAdmin && (
          <div className="bg-indigo-600 text-slate-100 px-6 py-2.5 flex flex-wrap items-center justify-between border-b border-indigo-700 text-xs font-semibold z-40 sticky top-0" id="impersonation_banner">
            <div className="flex items-center gap-2">
              <span className="text-sm">👁️</span>
              <span>
                <strong>Modo Vista (Impersonación)</strong> — Conectado como{' '}
                {currentRole === 'gym_admin' ? (
                  <span>
                    Administrador de la Sede:{' '}
                    <span className="underline font-bold text-white pr-1">
                      {gyms.find((g) => g.id === activeGymId)?.name || `ID #${activeGymId}`}
                    </span>
                  </span>
                ) : (
                  <span>
                    Socio / Cliente:{' '}
                    <span className="underline font-bold text-white pr-1">
                      {clients.find((c) => c.id === activeClientId)?.name || `ID #${activeClientId}`}
                    </span>
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={handleStopImpersonating}
              className="bg-slate-950 hover:bg-slate-900 transition text-emerald-400 border border-emerald-500/30 font-mono px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer"
            >
              [DETENER & VOLVER A MAESTRO]
            </button>
          </div>
        )}

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
                  gymAdmins={gymAdmins}
                  onAddGymAdmin={handleAddGymAdmin}
                  onEditGymAdmin={handleEditGymAdmin}
                  onDeleteGymAdmin={handleDeleteGymAdmin}
                  onImpersonate={handleImpersonate}
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
                  activeClientId={activeClientId}
                  onActiveClientIdChange={setActiveClientId}
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
