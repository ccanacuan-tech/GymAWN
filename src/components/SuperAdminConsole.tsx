/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gym, Client, Plan } from '../types';
import { Building2, Plus, Edit2, ShieldAlert, CheckCircle, Database, Smartphone, Globe, Mail, MapPin, Compass, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuperAdminConsoleProps {
  gyms: Gym[];
  clients: Client[];
  planes: Plan[];
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
  onAddGym,
  onUpdateGymStatus,
  onUpdateGymPlan,
  onDeleteGym,
  onLogAdd,
}: SuperAdminConsoleProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlanType, setNewPlanType] = useState<'Básico' | 'Profesional' | 'Enterprise'>('Profesional');

  const [editingGymId, setEditingGymId] = useState<number | null>(null);

  // Computations for Super Admin
  const totalGyms = gyms.length;
  const activeGymsCount = gyms.filter(g => g.status === 'Activo').length;
  const totalClientsAcrossSaaS = clients.length;

  // Let's assume SaaS values: Básico: $49/mo, Profesional: $99/mo, Enterprise: $199/mo
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

    // Clean subdomain
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

    // Reset fields
    setNewName('');
    setNewSubdomain('');
    setNewAddress('');
    setNewPhone('');
    setNewEmail('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8" id="super_admin_console_container">
      {/* Super Admin Title Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5Under">
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
          <p className="text-xs text-slate-400">
            Añada nuevas sedes, configure subdominios de base de datos aislada verticalmente, y analice ingresos por suscripción.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto shadow-lg shadow-indigo-500/10"
        >
          <Plus size={14} />
          <span>Añadir Nueva Sede</span>
        </button>
      </div>

      {/* Aggregated Super Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="super_admin_vitals_kpi">
        {/* KPI 1 */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Total de Sedes (SaaS)</span>
            <div className="text-3xl font-extrabold text-white">{totalGyms}</div>
            <div className="text-[10px] text-indigo-400 font-mono">
              🔋 {activeGymsCount} sedes operando en línea
            </div>
          </div>
          <div className="p-3 bg-slate-950 text-indigo-400 border border-slate-850 rounded-xl">
            <Building2 size={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Licenciamiento SaaS MRR</span>
            <div className="text-3xl font-extrabold text-emerald-400">${currentMRR} USD</div>
            <div className="text-[10px] text-slate-400">Facturación global / mes</div>
          </div>
          <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-850 rounded-xl">
            <Database size={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Socios Globales Multi-Sede</span>
            <div className="text-3xl font-extrabold text-white">{totalClientsAcrossSaaS}</div>
            <div className="text-[10px] text-slate-500">
              Uso del espacio de almacenamiento SQL
            </div>
          </div>
          <div className="p-3 bg-slate-950 text-indigo-400 border border-slate-850 rounded-xl">
            <Smartphone size={20} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold font-mono uppercase">Status de Conectividad</span>
            <div className="text-sm font-bold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Sistemas Sin Retraso
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Uptime general: 99.98%</div>
          </div>
          <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-850 rounded-xl">
            <Globe size={18} />
          </div>
        </div>
      </div>

      {/* Add Sede form collapsing */}
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
              {/* Sede Name */}
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

              {/* Subdomain */}
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

              {/* CRM Subscription Plan Type */}
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

              {/* Email */}
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

              {/* Phone */}
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

              {/* Address */}
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

      {/* List of Gym Locations / Sedes */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
          Estructura de Sedes Registradas (Aislamiento MySQL)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gyms.map((gym) => {
            const isEditing = editingGymId === gym.id;
            const gymClientsCount = clients.filter(c => c.gymId === gym.id).length;

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
                    <p className="flex items-center gap-1.5">
                      <Mail size={10} className="text-slate-500" />
                      <span>{gym.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Compass size={10} className="text-slate-500" />
                      <span>{gym.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 w-full">
                      {/* Edit status dropdown */}
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

                      {/* Edit plan type dropdown */}
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
                      <div className="text-[10px] text-slate-500 italic">
                        Creado: {gym.createdAt}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingGymId(gym.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit2 size={10} />
                          <span>Editar Sede</span>
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
          })}
        </div>
      </div>
    </div>
  );
}
