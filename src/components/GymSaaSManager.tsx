/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gym, Client, Plan, ClassSession, ProductInventory } from '../types';
import { Plus, Search, Trash2, Edit, Save, Calculator, BookOpen, Layers, Check, ShoppingBag, Eye, Download } from 'lucide-react';
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
  onAddPlan?: (newPlan: Omit<Plan, 'id'>) => void;
  onDeletePlan?: (id: number) => void;
  onAddClass?: (newClass: Omit<ClassSession, 'id'>) => void;
  onDeleteClass?: (id: number) => void;
  onAddProduct?: (newProduct: Omit<ProductInventory, 'id'>) => void;
  onDeleteProduct?: (id: number) => void;
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
  onAddPlan,
  onDeletePlan,
  onAddClass,
  onDeleteClass,
  onAddProduct,
  onDeleteProduct,
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

  // New Plan Form inputs
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(30.0);
  const [planDuration, setPlanDuration] = useState(1);
  const [planBenefits, setPlanBenefits] = useState('');

  // New Class Form inputs
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [clsClassName, setClsClassName] = useState('');
  const [clsTrainer, setClsTrainer] = useState('');
  const [clsSchedule, setClsSchedule] = useState('');
  const [clsRoom, setClsRoom] = useState('');
  const [clsCapacity, setClsCapacity] = useState(20);

  // New Product Form inputs
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<'Suplementos' | 'Ropa Deportiva' | 'Accesorios' | 'Equipos'>('Suplementos');
  const [prodPrice, setProdPrice] = useState(15.0);
  const [prodStock, setProdStock] = useState(10);
  const [prodMinStock, setProdMinStock] = useState(3);
  const [prodSupplier, setProdSupplier] = useState('');

  const activeGym = gyms.find(g => g.id === activeGymId) || gyms[0] || {
    id: activeGymId,
    name: 'Mega Power Gym',
    subdomain: 'megapower',
    address: 'Av. Fitness Centro 102',
    phone: '',
    email: '',
    planType: 'Básico',
    status: 'Activo',
    createdAt: ''
  };

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
  const gymPlanes = planes.filter(
    (p) => !p.gymId || p.gymId === activeGymId
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

  const handleDownloadCSV = () => {
    // 1. Create headers
    const headers = [
      'ID de Socio',
      'Nombre Completo',
      'Correo Electronico',
      'Telefono',
      'Plan de Membresia',
      'Fecha Inicio',
      'Fecha Fin',
      'Peso (kg)',
      'Estatura (cm)',
      'IMC',
      'Grupo Sanguineo',
      'Estado'
    ];

    // 2. Map data
    const rows = gymClients.map(client => {
      const clientPlan = planes.find(p => p.id === client.planId);
      return [
        client.id,
        `"${client.name.replace(/"/g, '""')}"`,
        `"${(client.email || '').replace(/"/g, '""')}"`,
        `"${(client.phone || '').replace(/"/g, '""')}"`,
        `"${(clientPlan?.name || '').replace(/"/g, '""')}"`,
        `"${client.membershipStart}"`,
        `"${client.membershipEnd}"`,
        client.weight,
        client.height,
        client.imc,
        `"${client.bloodType || ''}"`,
        `"${client.status}"`
      ];
    });

    // 3. Assemble CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    // 4. Create blob and download link with UTF-8 BOM
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const cleanGymName = activeGym.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.href = url;
    link.setAttribute('download', `reporte_socios_${cleanGymName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                id="btn_download_clients_csv"
                onClick={handleDownloadCSV}
                disabled={gymClients.length === 0}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-750 text-slate-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Descargar padrón de socios en formato CSV"
              >
                <Download size={14} className="text-emerald-400" />
                <span>Exportar CSV</span>
              </button>

              <button
                id="btn_open_add_client"
                onClick={() => setIsAdding(!isAdding)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Inscribir Nuevo Socio</span>
              </button>
            </div>
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
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Membresías y Tarifas</h3>
              <p className="text-[11px] text-slate-400">Administre los planes autorizados de esta sucursal.</p>
            </div>
            <button
              onClick={() => setIsAddingPlan(!isAddingPlan)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>{isAddingPlan ? 'Cerrar' : 'Crear Plan'}</span>
            </button>
          </div>

          <AnimatePresence>
            {isAddingPlan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4"
              >
                <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">Crear Plan Multi-tenant</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!planName) return;
                    onAddPlan?.({
                      name: planName,
                      price: Number(planPrice),
                      durationMonths: Number(planDuration),
                      benefits: planBenefits.split(',').map(b => b.trim()).filter(Boolean),
                      gymId: activeGymId,
                    });
                    setPlanName('');
                    setPlanPrice(30.0);
                    setPlanDuration(1);
                    setPlanBenefits('');
                    setIsAddingPlan(false);
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Nombre del Plan</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Plan Anual Elite"
                      value={planName}
                      onChange={e => setPlanName(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Precio Mensual ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="29.99"
                      value={planPrice}
                      onChange={e => setPlanPrice(Number(e.target.value))}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Duración (Meses)</label>
                    <select
                      value={planDuration}
                      onChange={e => setPlanDuration(Number(e.target.value))}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    >
                      <option value={1}>1 Mes (Mensual)</option>
                      <option value={3}>3 Meses (Trimestral)</option>
                      <option value={6}>6 Meses (Semestral)</option>
                      <option value={12}>12 Meses (Anual)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Beneficios (Separados por Coma)</label>
                    <input
                      type="text"
                      placeholder="Acceso 24/7, Toalla libre, Nutricionista"
                      value={planBenefits}
                      onChange={e => setPlanBenefits(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition"
                    >
                      Guardar en base de datos
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gymPlanes.map((plan) => (
              <div key={plan.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] uppercase font-bold tracking-wider font-mono p-1 rounded ${
                      plan.gymId ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                    }`}>
                      {plan.gymId ? 'Sede Personal' : 'SaaS Global'}
                    </span>
                    {plan.gymId && onDeletePlan && (
                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Eliminar Membresía"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3">{plan.name}</h4>
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
                  <span>ID Registro SQL</span>
                  <span className="text-slate-400 font-mono">#{plan.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: CLASSES */}
      {subTab === 'classes' && (
        <div className="space-y-6" id="saas_classes_module">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Clases de Fitness y Asistencia</h3>
              <p className="text-[11px] text-slate-400">Planifique las clases programadas para esta sucursal.</p>
            </div>
            <button
              onClick={() => setIsAddingClass(!isAddingClass)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>{isAddingClass ? 'Cerrar' : 'Crear Clase Colectiva'}</span>
            </button>
          </div>

          <AnimatePresence>
            {isAddingClass && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4"
              >
                <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">Crear Nueva Clase de Fitness</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!clsClassName) return;
                    onAddClass?.({
                      gymId: activeGymId,
                      className: clsClassName,
                      trainerName: clsTrainer || 'Staff General',
                      scheduleTime: clsSchedule || 'Horario Flexible',
                      roomName: clsRoom || 'Sala Activa',
                      maxCapacity: Number(clsCapacity),
                      currentReservations: 0
                    });
                    setClsClassName('');
                    setClsTrainer('');
                    setClsSchedule('');
                    setClsRoom('');
                    setClsCapacity(20);
                    setIsAddingClass(false);
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Actividad / Nombre Clase</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. BodyPump, Spinning, Yoga"
                      value={clsClassName}
                      onChange={e => setClsClassName(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Instructor Asignado</label>
                    <input
                      type="text"
                      placeholder="Ej. María Gómez"
                      value={clsTrainer}
                      onChange={e => setClsTrainer(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Horario Semanal</label>
                    <input
                      type="text"
                      placeholder="Ej. Lunes y Miércoles 19:30"
                      value={clsSchedule}
                      onChange={e => setClsSchedule(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Salón de Entrenamiento</label>
                    <input
                      type="text"
                      placeholder="Ej. Salón Ciclo 3, Box Crossfit"
                      value={clsRoom}
                      onChange={e => setClsRoom(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Capacidad Máxima de Cupos</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={clsCapacity}
                      onChange={e => setClsCapacity(Number(e.target.value))}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition hover:bg-emerald-550 cursor-pointer"
                    >
                      Programar Nueva Clase
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-955/20">
                    <th className="py-3 px-4">Clase / Actividad</th>
                    <th className="py-3 px-4">Instructor Asignado</th>
                    <th className="py-3 px-4">Horarios Programados</th>
                    <th className="py-3 px-4">Ubicación / Salón</th>
                    <th className="py-3 px-4">Capacidad de Cupos</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {gymClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
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
                          <td className="py-3.5 px-4 text-right">
                            {onDeleteClass && (
                              <button
                                onClick={() => onDeleteClass(cl.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/20 transition cursor-pointer"
                                title="Cancelar Clase"
                              >
                                <Trash2 size={13} />
                              </button>
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

      {/* SUB-TAB: INVENTORY */}
      {subTab === 'inventory' && (
        <div className="space-y-6" id="saas_inventory_module">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Inventario y Catálogo de Tienda</h3>
              <p className="text-[11px] text-slate-400">Controle el stock de suplementos y accesorios deportivos.</p>
            </div>
            <button
              onClick={() => setIsAddingProduct(!isAddingProduct)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>{isAddingProduct ? 'Cerrar' : 'Agregar Producto'}</span>
            </button>
          </div>

          <AnimatePresence>
            {isAddingProduct && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4"
              >
                <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">Registrar Producto de Sede</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!prodName) return;
                    onAddProduct?.({
                      gymId: activeGymId,
                      name: prodName,
                      category: prodCategory,
                      price: Number(prodPrice),
                      stock: Number(prodStock),
                      minStock: Number(prodMinStock),
                      supplier: prodSupplier || 'Proveedor Sede General'
                    });
                    setProdName('');
                    setProdCategory('Suplementos');
                    setProdPrice(15.0);
                    setProdStock(10);
                    setProdMinStock(3);
                    setProdSupplier('');
                    setIsAddingProduct(false);
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Nombre del Producto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Proteína Whey 1kg, Shaker Gold"
                      value={prodName}
                      onChange={e => setProdName(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Categoría</label>
                    <select
                      value={prodCategory}
                      onChange={e => setProdCategory(e.target.value as any)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Suplementos">Suplementos</option>
                      <option value="Ropa Deportiva">Ropa Deportiva</option>
                      <option value="Accesorios">Accesorios</option>
                      <option value="Equipos">Equipos</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Precio de Venta ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prodPrice}
                      onChange={e => setProdPrice(Number(e.target.value))}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Stock Inicial (pz)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={prodStock}
                      onChange={e => setProdStock(Number(e.target.value))}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Stock de Alerta Mínima</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={prodMinStock}
                      onChange={e => setProdMinStock(Number(e.target.value))}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Proveedor Oficial</label>
                    <input
                      type="text"
                      placeholder="Ej. Distribuidor Oficial Fitness España"
                      value={prodSupplier}
                      onChange={e => setProdSupplier(e.target.value)}
                      className="bg-slate-955 border border-slate-800 rounded-lg text-xs p-2 text-white w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition hover:bg-emerald-550 cursor-pointer"
                    >
                      Guardar en Inventario
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono bg-slate-955/20">
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Proveedor Oficial</th>
                    <th className="py-3 px-4">Precio Venta</th>
                    <th className="py-3 px-4">Stock de Caja</th>
                    <th className="py-3 px-4">Estatus Almacén</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {gymProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
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
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                                isLow ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                              }`}
                            >
                              {isLow ? 'Abastecer' : 'Disponible'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {onDeleteProduct && (
                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/20 transition cursor-pointer"
                                title="Eliminar Producto"
                              >
                                <Trash2 size={13} />
                              </button>
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
    </div>
  );
}
