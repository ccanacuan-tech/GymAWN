/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gym, Client, Plan, ClassSession, ProductInventory } from '../types';
import { Plus, Search, Trash2, Edit, Save, Calculator, BookOpen, Layers, Check, ShoppingBag, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GymSaaSManagerProps {
  gyms: Gym[];
  clients: Client[];
  products: ProductInventory[];
  planes: Plan[];
  classes: ClassSession[];
  activeGymId: number;
  onAddClient: (newClient: Omit<Client, 'id' | 'qrCode'>) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: number) => void;
}

export default function GymSaaSManager({
  gyms,
  clients,
  products,
  planes,
  classes,
  activeGymId,
  onAddClient,
  onEditClient,
  onDeleteClient,
}: GymSaaSManagerProps) {
  const [subTab, setSubTab] = useState<'clients' | 'plans' | 'classes' | 'inventory'>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Client CRUD states
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingId, setIsEditingId] = useState<number | null>(null);

  // New Client Form inputs
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlanId, setNewPlanId] = useState<number>(planes[0]?.id || 1);
  const [newWeight, setNewWeight] = useState(70);
  const [newHeight, setNewHeight] = useState(170);
  const [newBloodType, setNewBloodType] = useState('O+');

  // Edit states values
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'Activo' | 'Vencido' | 'Congelado'>('Activo');
  const [editPlanId, setEditPlanId] = useState(1);
  const [editWeight, setEditWeight] = useState(70);
  const [editHeight, setEditHeight] = useState(170);

  const activeGym = gyms.find(g => g.id === activeGymId) || gyms[0];

  // Filters based on active Gym (Tenant ID isolation!)
  const gymClients = clients.filter(
    (c) => c.gymId === activeGymId && c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const gymProducts = products.filter(
    (p) => p.gymId === activeGymId && p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const gymClasses = classes.filter(
    (cl) => cl.gymId === activeGymId && cl.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto calculate BMI (IMC)
  const calculateIMC = (weight: number, heightCm: number) => {
    if (weight <= 0 || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(2));
  };

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { text: 'Bajo peso', color: 'text-amber-400' };
    if (imc < 25) return { text: 'Normal', color: 'text-emerald-400' };
    if (imc < 30) return { text: 'Sobrepeso', color: 'text-amber-500' };
    return { text: 'Obesidad', color: 'text-rose-500' };
  };

  const currentIMC = calculateIMC(newWeight, newHeight);
  const currentIMCCat = getIMCCategory(currentIMC);

  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    // Default dates (current month)
    const start = new Date();
    const end = new Date();
    const selectedPlanObj = planes.find(p => p.id === Number(newPlanId));
    const duration = selectedPlanObj ? selectedPlanObj.durationMonths : 1;
    end.setMonth(start.getMonth() + duration);

    const pad = (num: number) => num.toString().padStart(2, '0');
    const startF = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const endF = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

    onAddClient({
      gymId: activeGymId,
      name: newName,
      email: newEmail,
      phone: newPhone,
      planId: Number(newPlanId),
      status: 'Activo',
      membershipStart: startF,
      membershipEnd: endF,
      weight: Number(newWeight),
      height: Number(newHeight),
      imc: currentIMC,
      bloodType: newBloodType,
    });

    // Reset fields
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setIsAdding(false);
  };

  const startEdit = (c: Client) => {
    setIsEditingId(c.id);
    setEditName(c.name);
    setEditEmail(c.email);
    setEditPhone(c.phone);
    setEditStatus(c.status);
    setEditPlanId(c.planId);
    setEditWeight(c.weight);
    setEditHeight(c.height);
  };

  const saveEdit = (c: Client) => {
    const editIMC = calculateIMC(editWeight, editHeight);
    onEditClient({
      ...c,
      name: editName,
      email: editEmail,
      phone: editPhone,
      status: editStatus,
      planId: editPlanId,
      weight: Number(editWeight),
      height: Number(editHeight),
      imc: editIMC,
    });
    setIsEditingId(null);
  };

  return (
    <div className="space-y-6" id="gym_saas_manager_container">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800" id="manager_subtabs">
        <button
          onClick={() => { setSubTab('clients'); setSearchQuery(''); }}
          className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 transition border-b-2 -mb-px focus:outline-none ${
            subTab === 'clients'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Plus size={14} />
          <span>Socios (Clientes)</span>
        </button>
        <button
          onClick={() => { setSubTab('plans'); setSearchQuery(''); }}
          className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 transition border-b-2 -mb-px focus:outline-none ${
            subTab === 'plans'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          <span>Membresías y Tarifas</span>
        </button>
        <button
          onClick={() => { setSubTab('classes'); setSearchQuery(''); }}
          className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 transition border-b-2 -mb-px focus:outline-none ${
            subTab === 'classes'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen size={14} />
          <span>Clases Grupales</span>
        </button>
        <button
          onClick={() => { setSubTab('inventory'); setSearchQuery(''); }}
          className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 transition border-b-2 -mb-px focus:outline-none ${
            subTab === 'inventory'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Inventario de Tienda</span>
        </button>
      </div>

      {/* Tenant Alert Box */}
      <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <span>🔒</span>
          <span>Aislamiento de Datos Activo:</span>
          <span className="text-white font-semibold">{activeGym.name}</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 rounded">{`tenant_id = ${activeGymId}`}</span>
        </div>
        <span className="hidden sm:inline text-slate-500">PDO MySQL segregado</span>
      </div>

      {/* SUB-TAB: CLIENTS */}
      {subTab === 'clients' && (
        <div className="space-y-6" id="saas_clients_module">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar socios por nombre..."
                className="bg-slate-900 border border-slate-800 text-xs rounded-xl pl-10 pr-4 py-2 w-full text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Addition trigger */}
            <button
              id="btn_open_add_client"
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <Plus size={14} />
              <span>Inscribir Nuevo Socio</span>
            </button>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.form
                onSubmit={handleCreateClientSubmit}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-6"
                id="add_client_form"
              >
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Calculator size={16} className="text-emerald-400" />
                  <span>Ficha de Inscripción & Medición Corporal (PDO Segura)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Marcelo Salas"
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-emerald-500"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-emerald-500"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Teléfono Móvil</label>
                    <input
                      type="text"
                      placeholder="Ej: +34 611 222 333"
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-emerald-500"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </div>

                  {/* Plan selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Plan de Membresía</label>
                    <select
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-emerald-500"
                      value={newPlanId}
                      onChange={(e) => setNewPlanId(Number(e.target.value))}
                    >
                      {planes.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bio factors: Weight */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Peso Corporal (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-emerald-500"
                      value={newWeight}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Estatura (cm)</label>
                    <input
                      type="number"
                      className="bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 w-full text-white focus:outline-none focus:border-emerald-500"
                      value={newHeight}
                      onChange={(e) => setNewHeight(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* IMC autocalculated warning strip */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🧘</span>
                    <span className="text-xs text-slate-400">Índice de Masa Corporal (Auto-calculado para BD):</span>
                    <span className="text-white font-bold font-mono text-xs">{currentIMC}</span>
                    <span className={`text-xs ml-2 font-semibold ${currentIMCCat.color}`}>({currentIMCCat.text})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] text-slate-500 font-mono">Tipo Sangre:</label>
                    <input
                      type="text"
                      className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-white w-12 text-center"
                      value={newBloodType}
                      onChange={(e) => setNewBloodType(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
                  >
                    Inscribir y Guardar
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Listing table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="saas_clients_table">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-950/20">
                    <th className="py-3 px-4">Socio / Contacto</th>
                    <th className="py-3 px-4">Suscripción</th>
                    <th className="py-3 px-4">Vigencia Membresía</th>
                    <th className="py-3 px-4">Medidas / IMC</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {gymClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        No se encontraron socios registrados para {activeGym.name}.
                      </td>
                    </tr>
                  ) : (
                    gymClients.map((client) => {
                      const clientPlan = planes.find((p) => p.id === client.planId);
                      const isEditing = isEditingId === client.id;

                      return (
                        <tr key={client.id} className="hover:bg-slate-850/30 transition">
                          {/* Client general info */}
                          <td className="py-3.5 px-4">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                                <input
                                  type="email"
                                  className="bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-[10px] text-emerald-400 w-full"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                />
                              </div>
                            ) : (
                              <div>
                                <p className="font-semibold text-white">{client.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{client.email || 'Sin correo'} • {client.phone || 'Sin cel'}</p>
                              </div>
                            )}
                          </td>

                          {/* Client Plan pricing */}
                          <td className="py-3.5 px-4 font-mono text-xs">
                            {isEditing ? (
                              <select
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                value={editPlanId}
                                onChange={(e) => setEditPlanId(Number(e.target.value))}
                              >
                                {planes.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-medium text-white">{clientPlan?.name || 'Recurrente'}</span>
                            )}
                          </td>

                          {/* Validity dates */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[10px] text-slate-400">
                              <p>Inicia: {client.membershipStart}</p>
                              <p className="mt-0.5">Vence: <span className={client.status === 'Vencido' ? "text-rose-400 font-semibold" : "text-slate-300"}>{client.membershipEnd}</span></p>
                            </div>
                          </td>

                          {/* Weight Height BMI */}
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                            {isEditing ? (
                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  className="bg-slate-950 border border-slate-800 rounded w-12 px-1 text-center"
                                  value={editWeight}
                                  onChange={(e) => setEditWeight(Number(e.target.value))}
                                />
                                <input
                                  type="number"
                                  className="bg-slate-950 border border-slate-800 rounded w-12 px-1 text-center"
                                  value={editHeight}
                                  onChange={(e) => setEditHeight(Number(e.target.value))}
                                />
                              </div>
                            ) : (
                              <div>
                                <p>{client.weight} kg • {client.height} cm</p>
                                <p className="text-emerald-400 font-semibold mt-0.5">IMC: {client.imc}</p>
                              </div>
                            )}
                          </td>

                          {/* Active state tag */}
                          <td className="py-3.5 px-4">
                            {isEditing ? (
                              <select
                                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-white"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                              >
                                <option value="Activo">Activo</option>
                                <option value="Vencido">Vencido</option>
                                <option value="Congelado">Congelado</option>
                              </select>
                            ) : (
                              <span
                                className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                                  client.status === 'Activo'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : client.status === 'Vencido'
                                    ? 'bg-rose-500/10 text-rose-400'
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}
                              >
                                {client.status}
                              </span>
                            )}
                          </td>

                          {/* Quick row Actions */}
                          <td className="py-3.5 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => saveEdit(client)}
                                  className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setIsEditingId(null)}
                                  className="p-1 text-slate-500 hover:bg-slate-800 rounded text-xs font-sans"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => startEdit(client)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => onDeleteClient(client.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded transition"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
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

      {/* SUB-TAB: PLANS */}
      {subTab === 'plans' && (
        <div className="space-y-6" id="saas_plans_module">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {planes.map((plan) => (
              <div key={plan.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-mono">Plan Catálogo</div>
                  <h4 className="text-sm font-bold text-white mt-2">{plan.name}</h4>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-2">
                    ${plan.price.toFixed(2)}
                    {plan.durationMonths > 0 && (
                      <span className="text-[10px] text-slate-500 font-sans font-normal ml-1">
                        / {plan.durationMonths === 12 ? 'Anual' : `${plan.durationMonths} Mes`}
                      </span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-2 text-[11px] text-slate-400">
                    {plan.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-emerald-400 mr-1.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-850 flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Acciones de plan</span>
                  <span className="text-emerald-400">PDO-ReadOnly</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: CLASSES */}
      {subTab === 'classes' && (
        <div className="space-y-6" id="saas_classes_module">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-950/20">
                    <th className="py-3 px-4">Clase / Actividad</th>
                    <th className="py-3 px-4">Instructor Asignado</th>
                    <th className="py-3 px-4">Horarios Programados</th>
                    <th className="py-3 px-4">Ubicación / Salón</th>
                    <th className="py-3 px-4">Capacidad de Cupos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {gymClasses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No hay clases de fitness programadas para {activeGym.name}.
                      </td>
                    </tr>
                  ) : (
                    gymClasses.map((cl) => {
                      const occupancyPercent = (cl.currentReservations / cl.maxCapacity) * 100;
                      return (
                        <tr key={cl.id} className="hover:bg-slate-850/30 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">{cl.className}</td>
                          <td className="py-3.5 px-4 text-slate-400">{cl.trainerName}</td>
                          <td className="py-3.5 px-4 text-emerald-400 font-mono text-[11px]">{cl.scheduleTime}</td>
                          <td className="py-3.5 px-4 text-slate-400">{cl.roomName}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3 w-32">
                              <span className="font-mono text-[10px] text-slate-400">
                                {cl.currentReservations}/{cl.maxCapacity}
                              </span>
                              <div className="flex-1 bg-slate-950 rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-1 bg-emerald-400 rounded-full"
                                  style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                                ></div>
                              </div>
                            </div>
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

      {/* SUB-TAB: INVENTORY */}
      {subTab === 'inventory' && (
        <div className="space-y-6" id="saas_inventory_module">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-950/20">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Proveedor Oficial</th>
                    <th className="py-3 px-4">Precio Venta</th>
                    <th className="py-3 px-4">Stock de Caja</th>
                    <th className="py-3 px-4 text-right">Estatus Almacén</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {gymProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No hay catálogo de inventario registrado para {activeGym.name}.
                      </td>
                    </tr>
                  ) : (
                    gymProducts.map((p) => {
                      const isLow = p.stock <= p.minStock;
                      return (
                        <tr key={p.id} className="hover:bg-slate-850/30 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">{p.name}</td>
                          <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">{p.supplier}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">${p.price.toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className={isLow ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              {p.stock} pz <span className="text-[10px] text-slate-500"> (Min {p.minStock})</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                                isLow ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}
                            >
                              {isLow ? 'Abastecer' : 'Disponible'}
                            </span>
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
  );
}
