/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gym, Client, Plan, GymAdmin } from '../types';
import { Building2, Plus, Edit2, ShieldAlert, CheckCircle, Database, Smartphone, Globe, Mail, MapPin, Compass, Trash2, Key, Users, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuperAdminConsoleProps {
  gyms: Gym[];
  clients: Client[];
  planes: Plan[];
  gymAdmins: GymAdmin[];
  onAddGymAdmin: (newAdmin: Omit<GymAdmin, 'id' | 'createdAt'>) => void;
  onEditGymAdmin: (updatedAdmin: GymAdmin) => void;
  onDeleteGymAdmin: (id: number) => void;
  onImpersonate: (role: 'gym_admin' | 'client', targetId: number) => void;
  onAddGym: (newGym: Omit<Gym, 'id' | 'createdAt'>) => void;
  onUpdateGymStatus: (id: number, status: 'Activo' | 'Suspendido') => void;
  onUpdateGymPlan: (id: number, planType: 'Básico' | 'Profesional' | 'Enterprise') => void;
  onDeleteGym: (id: number) => void;
  onLogAdd: (service: 'Database' | 'Backup' | 'API' | 'Auth' | 'Security', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export default function SuperAdminConsole({
  gyms,
  clients,
  planes,
  gymAdmins = [],
  onAddGymAdmin,
  onEditGymAdmin,
  onDeleteGymAdmin,
  onImpersonate,
  onAddGym,
  onUpdateGymStatus,
  onUpdateGymPlan,
  onDeleteGym,
  onLogAdd,
}: SuperAdminConsoleProps) {
  // Navigation Tabs for Subsections
  const [activeSubTab, setActiveSubTab] = useState<'sedes' | 'admins' | 'socios'>('sedes');

  // Sede creation form state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlanType, setNewPlanType] = useState<'Básico' | 'Profesional' | 'Enterprise'>('Profesional');

  const [editingGymId, setEditingGymId] = useState<number | null>(null);

  // GymAdmin creation form state
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [admName, setAdmName] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [admPhone, setAdmPhone] = useState('');
  const [admGymId, setAdmGymId] = useState<number>(gyms[0]?.id || 1);
  const [admStatus, setAdmStatus] = useState<'Activo' | 'Suspendido'>('Activo');
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);

  // Computations for Super Admin
  const totalGyms = gyms.length;
  const activeGymsCount = gyms.filter(g => g.status === 'Activo').length;
  const totalClientsAcrossSaaS = clients.length;

  const calculateSaaSMRR = () => {
    return gyms.reduce((acc, g) => {
      if (g.status !== 'Activo') return acc;
      if (g.planType === 'Básico') return acc + 49;
      if (g.planType === 'Profesional') return acc + 99;
      if (g.planType === 'Enterprise') return acc + 199;
      return acc;
    }, 0);
  };

  const currentMRR = calculateSaaSMRR();

  const handleCreateGymSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSubdomain) return;

    const cleanSubdomain = newSubdomain.toLowerCase().replace(/[^a-z0-9]/g, '');

    onAddGym({
      name: newName,
      subdomain: cleanSubdomain,
      address: newAddress || 'Dirección General',
      phone: newPhone || '+34 600 000 000',
      email: newEmail || `admin@${cleanSubdomain}.com`,
      planType: newPlanType,
      status: 'Activo',
    });

    onLogAdd('Database', 'success', `PDO INSERT: Creado nuevo registro de sede '${newName}' con isolation tenant_id en base de datos SaaS.`);

    setNewName('');
    setNewSubdomain('');
    setNewAddress('');
    setNewPhone('');
    setNewEmail('');
    setIsAdding(false);
  };

  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admName || !admEmail) return;

    onAddGymAdmin({
      name: admName,
      email: admEmail,
      phone: admPhone || '+34 600 000 000',
      gymId: Number(admGymId || gyms[0]?.id || 1),
      status: admStatus,
    });

    setAdmName('');
    setAdmEmail('');
    setAdmPhone('');
    setIsAddingAdmin(false);
  };

  return (
    <div className="space-y-8" id="super_admin_console_container">
      {/* Super Admin Title Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 px-3 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
              Control Maestro Super Admin
            </span>
            <span className="flex items-center text-[10px] text-slate-400 font-mono">
              ⚡ Multi-tenant Database Isolation
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            🏢 Panel de Control Global (SaaS Sede & Gimnasios)
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Añada nuevas sedes, configure subdominios de base de datos aislada, genere cuentas de administradores, e ingrese a cualquier perfil.
          </p>
        </div>

        {activeSubTab === 'sedes' ? (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto shadow-lg shadow-indigo-500/10"
          >
            <Plus size={14} />
            <span>Añadir Nueva Sede</span>
          </button>
        ) : activeSubTab === 'admins' ? (
          <button
            onClick={() => setIsAddingAdmin(!isAddingAdmin)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto shadow-lg shadow-amber-500/10"
          >
            <Plus size={14} />
            <span>Generar Cuenta Administrador</span>
          </button>
        ) : null}
      </div>

      {/* Aggregated Super Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="super_admin_vitals_kpi">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Total de Sedes (SaaS)</span>
            <div className="text-2xl font-extrabold text-white">{totalGyms}</div>
            <div className="text-[10px] text-indigo-400 font-mono">
              🔋 {activeGymsCount} sedes operando en línea
            </div>
          </div>
          <div className="p-3 bg-slate-950 text-indigo-400 border border-slate-850 rounded-xl">
            <Building2 size={20} />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Facturación SaaS MRR</span>
            <div className="text-2xl font-extrabold text-emerald-400">${currentMRR} USD</div>
            <div className="text-[10px] text-slate-400">Facturación global / mes</div>
          </div>
          <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-850 rounded-xl">
            <Database size={20} />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Socios Globales Multi-Sede</span>
            <div className="text-2xl font-extrabold text-white">{totalClientsAcrossSaaS}</div>
            <div className="text-[10px] text-slate-500">
              Uso del espacio de almacenamiento SQL
            </div>
          </div>
          <div className="p-3 bg-slate-950 text-indigo-400 border border-slate-850 rounded-xl">
            <Smartphone size={20} />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Cuentas de Admin</span>
            <div className="text-2xl font-extrabold text-amber-400">{gymAdmins.length} creadas</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Control de credenciales</div>
          </div>
          <div className="p-3 bg-slate-950 text-amber-400 border border-slate-850 rounded-xl">
            <Key size={18} />
          </div>
        </div>
      </div>

      {/* Sub tabs selector bar */}
      <div className="flex flex-wrap border-b border-slate-850" id="saas_sub_tab_bar_root">
        <button
          onClick={() => setActiveSubTab('sedes')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeSubTab === 'sedes'
              ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Building2 size={14} />
          <span>Sedes / Gimnasios ({gyms.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('admins')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeSubTab === 'admins'
              ? 'text-amber-400 border-amber-500 bg-amber-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Key size={14} />
          <span>Administradores Sede ({gymAdmins.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('socios')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeSubTab === 'socios'
              ? 'text-emerald-400 border-emerald-500 bg-emerald-400/5'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Users size={14} />
          <span>Acceso Directo Socios ({clients.length})</span>
        </button>
      </div>

      {/* VIEW CONDITIONAL RENDER SPANS */}
      <div id="saas_console_viewport">
        {/* SUBTAB 1: SEDES MANAGEMENT */}
        {activeSubTab === 'sedes' && (
          <div className="space-y-6" id="sedes_management_pane">
            <AnimatePresence>
              {isAdding && (
                <motion.form
                  onSubmit={handleCreateGymSubmit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-5"
                  id="add_gym_form"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono text-indigo-400">
                    Registrar Nueva Ubicación o Sede (PHP-Tenant)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Nombre de la Sede *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Power Fitness Málaga"
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-indigo-500"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Subdominio de Acceso *</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="ej: malagafit"
                          className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 pr-20 w-full text-white font-mono focus:outline-none focus:border-indigo-500"
                          value={newSubdomain}
                          onChange={(e) => setNewSubdomain(e.target.value)}
                        />
                        <span className="absolute right-3 top-2 text-[10px] text-indigo-400 font-mono">.fit.com</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Plan de Licencia SaaS</label>
                      <select
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-indigo-500"
                        value={newPlanType}
                        onChange={(e) => setNewPlanType(e.target.value as any)}
                      >
                        <option value="Básico">Básico ($49/mes)</option>
                        <option value="Profesional">Profesional ($99/mes)</option>
                        <option value="Enterprise">Enterprise ($199/mes)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Correo Electrónico de Contacto</label>
                      <input
                        type="email"
                        placeholder="admin@malagafit.com"
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-indigo-500"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Teléfono Directo de la Sede</label>
                      <input
                        type="text"
                        placeholder="+34 688 122 344"
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-indigo-500"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Dirección Postal / Física</label>
                      <input
                        type="text"
                        placeholder="Av. del Sol, Málaga"
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-indigo-500"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
                    >
                      Inyectar Sede a MySQL
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gyms.length === 0 ? (
                <div className="col-span-2 text-center py-10 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                  Ninguna sede cargada.
                </div>
              ) : (
                gyms.map((gym) => {
                  const isEditing = editingGymId === gym.id;
                  const gymClientsCount = clients.filter(c => c.gymId === gym.id).length;
                  const isSedeGymAdmin = gymAdmins.find(a => a.gymId === gym.id);

                  return (
                    <div
                      key={gym.id}
                      className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            tenant_id = {gym.id}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${gym.status === 'Activo' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            <span className="text-[10px] font-mono text-slate-400">{gym.status}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>🏋️</span> {gym.name}
                          </h4>
                          <p className="text-[11px] font-sans text-slate-400 mt-1 flex items-center gap-1.5">
                            <MapPin size={11} className="text-slate-500" />
                            <span>{gym.address}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-1 border-y border-slate-850 text-left font-mono text-[10px] text-slate-400">
                          <div>
                            <span className="text-[9px] text-slate-500 block font-sans">Subdominio</span>
                            <span className="text-emerald-400">{gym.subdomain}.fit</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block font-sans">Plan Licencia</span>
                            <span className="text-white">{gym.planType}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block font-sans">Clientes Base</span>
                            <span className="text-white font-semibold">{gymClientsCount} activos</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[10px] text-slate-400 leading-normal font-mono">
                          <p className="flex items-center gap-1.55">
                            <Mail size={10} className="text-slate-500" />
                            <span>{gym.email}</span>
                          </p>
                          <p className="flex items-center gap-1.55">
                            <Compass size={10} className="text-slate-500" />
                            <span>{gym.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-850 flex flex-wrap gap-2.5 items-center justify-between">
                        {isEditing ? (
                          <div className="flex flex-wrap gap-2 w-full">
                            <select
                              className="bg-slate-950 border border-slate-800 text-[10px] rounded px-2 py-1 text-white"
                              value={gym.status}
                              onChange={(e) => {
                                onUpdateGymStatus(gym.id, e.target.value as any);
                                onLogAdd('Database', 'success', `PDO UPDATE: Se actualizó estado de Sede ID ${gym.id} a ${e.target.value}`);
                              }}
                            >
                              <option value="Activo">Activo</option>
                              <option value="Suspendido">Suspendido</option>
                            </select>

                            <select
                              className="bg-slate-950 border border-slate-800 text-[10px] rounded px-2 py-1 text-white"
                              value={gym.planType}
                              onChange={(e) => {
                                onUpdateGymPlan(gym.id, e.target.value as any);
                                onLogAdd('Database', 'success', `PDO UPDATE: Se actualizó plan de Sede ID ${gym.id} a ${e.target.value}`);
                              }}
                            >
                              <option value="Básico">Básico</option>
                              <option value="Profesional">Profesional</option>
                              <option value="Enterprise">Enterprise</option>
                            </select>

                            <button
                              onClick={() => setEditingGymId(null)}
                              className="ml-auto text-[10px] bg-indigo-500 text-slate-950 px-2 py-1 rounded font-bold hover:bg-indigo-600 transition cursor-pointer"
                            >
                              Listo
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onImpersonate('gym_admin', gym.id)}
                              className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/90 text-indigo-300 hover:text-slate-950 border border-indigo-500/20 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Ingresar directamente a esta sede con rol Administrador"
                            >
                              <Key size={10} />
                              <span>Simular Sede Admin</span>
                            </button>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingGymId(gym.id)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Edit2 size={10} />
                                <span>Editar</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  if (confirm(`¿Está seguro de eliminar la sede "${gym.name}"? Se perderá la segregación de datos.`)) {
                                    onDeleteGym(gym.id);
                                    onLogAdd('Database', 'warn', `PDO DELETE: Sede '${gym.name}' fue eliminada permanentemente.`);
                                  }
                                }}
                                className="p-1 px-1.5 bg-slate-805 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-transparent rounded text-[10px]"
                                title="Eliminar Sede"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: ADMINISTRADORES DE GIMNASIOS */}
        {activeSubTab === 'admins' && (
          <div className="space-y-6" id="admins_management_pane">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 mb-2">
              <span className="text-base">🔐</span>
              <div className="text-[11px] text-amber-200 font-sans leading-relaxed">
                <strong>Ingresos Autoritarios / Generación de Cuentas:</strong> En esta sección, el Super Admin puede registrar credenciales de administrador para cada sede o franquicia. Además, puede forzar ingresos inmediatos sin contraseña ("Impersonación") para fines de soporte técnico e inspección rápida.
              </div>
            </div>

            {/* Collapsible create admin form */}
            <AnimatePresence>
              {isAddingAdmin && (
                <motion.form
                  onSubmit={handleCreateAdminSubmit}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-5"
                  id="add_admin_form"
                >
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono text-amber-400">
                    Generar Nueva Cuenta de Administrador de Sede
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Hernán Cortés"
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-amber-500"
                        value={admName}
                        onChange={(e) => setAdmName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Correo Electrónico (Login) *</label>
                      <input
                        type="email"
                        required
                        placeholder="ej: hernan@megapower.fit"
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-amber-500"
                        value={admEmail}
                        onChange={(e) => setAdmEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Asignar Sede / Sucursal *</label>
                      <select
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-amber-500"
                        value={admGymId}
                        onChange={(e) => setAdmGymId(Number(e.target.value))}
                      >
                        {gyms.map(g => (
                          <option key={g.id} value={g.id}>{g.name} ({g.subdomain}.fit)</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Teléfono Celular</label>
                      <input
                        type="text"
                        placeholder="+34 656 123 456"
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-amber-500"
                        value={admPhone}
                        onChange={(e) => setAdmPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Status Inicial</label>
                      <select
                        className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-amber-500"
                        value={admStatus}
                        onChange={(e) => setAdmStatus(e.target.value as any)}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Suspendido">Suspendido</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAdmin(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
                    >
                      Generar Credenciales y Registrar
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List of Admin Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gymAdmins.length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                  Ningún administrador de gimnasio registrado en el sistema.
                </div>
              ) : (
                gymAdmins.map((admin) => {
                  const correlatedGym = gyms.find(g => g.id === admin.gymId);
                  const isEditingAdmin = editingAdminId === admin.id;

                  return (
                    <div
                      key={admin.id}
                      className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            ID Admin: {admin.id}
                          </span>

                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            admin.status === 'Activo'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {admin.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span className="text-base">👤</span> {admin.name}
                          </h4>
                          <p className="text-[11px] font-sans text-amber-300 font-semibold mt-1 flex items-center gap-1.5">
                            <Building2 size={11} className="text-slate-500" />
                            <span>Gimnasio: {correlatedGym?.name || `ID #${admin.gymId}`}</span>
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-850 text-[10px] font-mono text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <Mail size={10} className="text-slate-505" />
                            <span>{admin.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Compass size={10} className="text-slate-505" />
                            <span>{admin.phone}</span>
                          </p>
                          <p className="text-[9px] text-slate-500">
                            Registrado: {admin.createdAt}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                        {isEditingAdmin ? (
                          <div className="flex gap-2 w-full justify-between items-center">
                            <select
                              className="bg-slate-950 border border-slate-800 text-[10px] rounded px-2 py-1 text-white"
                              value={admin.status}
                              onChange={(e) => {
                                onEditGymAdmin({ ...admin, status: e.target.value as any });
                              }}
                            >
                              <option value="Activo">Activo</option>
                              <option value="Suspendido">Suspendido</option>
                            </select>

                            <button
                              onClick={() => setEditingAdminId(null)}
                              className="text-[10px] bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-bold hover:bg-amber-600 transition"
                            >
                              Guardar
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onImpersonate('gym_admin', admin.gymId)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                              title="Ingresar directamente con la sesión de este administrador"
                            >
                              <Key size={10} />
                              <span>Iniciar Sesión como</span>
                            </button>

                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => setEditingAdminId(admin.id)}
                                className="p-1 px-2 border border-slate-800 text-slate-400 hover:text-white rounded text-[10px]"
                                title="Editar Cuenta"
                              >
                                <Edit2 size={10} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar la cuenta del administrador "${admin.name}"?`)) {
                                    onDeleteGymAdmin(admin.id);
                                  }
                                }}
                                className="p-1 px-2 border border-transparent hover:border-rose-900 text-slate-500 hover:text-rose-450 rounded text-[10px]"
                                title="Eliminar Cuenta"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: ACCESO DIRECTO A SOCIOS (INTERPESONAR) */}
        {activeSubTab === 'socios' && (
          <div className="space-y-6" id="socios_impersonation_pane">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 mb-2">
              <span className="text-base">👤</span>
              <div className="text-[11px] text-emerald-200 font-sans leading-relaxed">
                <strong>Simular Socio de Gimnasio:</strong> Abajo se detallan todos los socios registrados de forma general. Como Super Admin, se le permite impersonar (hacer Login) de inmediato con el perfil de cualquier socio cliente. Esto cargará el correspondido portal del socio con su respectivo código QR sincronizado, reservas de su sede e historial de IMC.
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4.5 border-b border-slate-850">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Socio-Clientes Globales del Ecosistema SaaS
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] font-mono tracking-wider border-b border-slate-850">
                    <tr>
                      <th className="p-4">Socio (ID)</th>
                      <th className="p-4">Sede Correlacionada</th>
                      <th className="p-4">Contacto</th>
                      <th className="p-4 font-mono text-center">Status</th>
                      <th className="p-4 text-center">Acciones Autoritarias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">
                          Ningún socio registrado en el sistema.
                        </td>
                      </tr>
                    ) : (
                      clients.map((socio) => {
                        const socioGym = gyms.find(g => g.id === socio.gymId);
                        return (
                          <tr key={socio.id} className="hover:bg-slate-850/40 transition">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-[10px]">
                                  {socio.name.substring(0,2).toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-white leading-normal">{socio.name}</p>
                                  <p className="text-[9px] font-mono text-slate-500">ID: {socio.id} | QR: {socio.qrCode}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-200">{socioGym?.name || `ID ${socio.gymId}`}</p>
                                <p className="text-[9px] text-indigo-400 font-mono">/{socioGym?.subdomain}.fit</p>
                              </div>
                            </td>
                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                              <p>{socio.email}</p>
                              <p className="text-slate-550">{socio.phone}</p>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                                socio.status === 'Activo'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-450'
                              }`}>
                                {socio.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => onImpersonate('client', socio.id)}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 text-[10px] rounded-lg transition duration-150 cursor-pointer inline-flex items-center gap-1"
                              >
                                <User size={10} />
                                <span>Iniciar Sesión como Socio</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
