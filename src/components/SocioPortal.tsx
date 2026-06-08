/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gym, Client, Plan, ClassSession, ProductInventory } from '../types';
import { Sparkles, Calendar, HeartPulse, User, Dumbbell, ShoppingCart, Percent, QrCode, ArrowRight, ShieldCheck, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SocioPortalProps {
  gyms: Gym[];
  clients: Client[];
  planes: Plan[];
  classes: ClassSession[];
  products: ProductInventory[];
  onBookClass: (classId: number) => void;
  onCancelBooking: (classId: number) => void;
  onBuyProduct: (productId: number) => void;
  onUpdateClientBiometrics: (clientId: number, weight: number, height: number) => void;
  onLogAdd: (service: 'Database' | 'Backup' | 'API' | 'Auth' | 'Security', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export default function SocioPortal({
  gyms,
  clients,
  planes,
  classes,
  products,
  onBookClass,
  onCancelBooking,
  onBuyProduct,
  onUpdateClientBiometrics,
  onLogAdd,
}: SocioPortalProps) {
  // Select active client simulation in portal
  const [selectedClientId, setSelectedClientId] = useState<number>(clients[0]?.id || 1);
  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const activeGym = gyms.find(g => g.id === activeClient.gymId) || gyms[0];
  const activePlan = planes.find(p => p.id === activeClient.planId);

  // States for biometric quick fields edit
  const [weightInput, setWeightInput] = useState<number>(activeClient.weight);
  const [heightInput, setHeightInput] = useState<number>(activeClient.height);
  const [isEditingBiometrics, setIsEditingBiometrics] = useState(false);

  // Checkout alerts states mockup
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Auto-calculated IMC
  const rawIMC = activeClient.weight / ((activeClient.height / 100) * (activeClient.height / 100));
  const currentIMC = parseFloat(rawIMC.toFixed(2));

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { text: 'Bajo peso', color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'Te recomendamos consultar planes de ganancia de masa magra.' };
    if (imc < 25) return { text: 'Peso Óptimo', color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: '¡Estadística perfecta! Mantén tu rutina de entrenamiento y nutrición.' };
    if (imc < 30) return { text: 'Sobrepeso Gradual', color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Se sugiere enfocar rutinas cardiovasculares y déficit calórico leve.' };
    return { text: 'Obesidad', color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Consulta planes personalizados y clases HIIT de alta quema.' };
  };

  const getDaysRemaining = (endDateStr: string) => {
    try {
      const end = new Date(endDateStr);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 15;
    }
  };

  const imcInfo = getIMCCategory(currentIMC);
  const daysLeft = getDaysRemaining(activeClient.membershipEnd);

  // Classes under client's GYM (Tenant Aisolated)
  const currentGymClasses = classes.filter(cl => cl.gymId === activeClient.gymId);
  const currentGymProducts = products.filter(p => p.gymId === activeClient.gymId);

  const handleSaveBiometrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightInput <= 0 || heightInput <= 0) return;

    onUpdateClientBiometrics(activeClient.id, Number(weightInput), Number(heightInput));
    setIsEditingBiometrics(false);
    onLogAdd('Database', 'success', `PDO UPDATE: Socio ID ${activeClient.id} actualizó sus medidas a ${weightInput}kg / ${heightInput}cm.`);
  };

  const triggerMockBuy = (p: ProductInventory) => {
    if (p.stock <= 0) return;
    onBuyProduct(p.id);
    setPurchaseSuccess(`¡Compraste con éxito: ${p.name}! Descontado del stock.`);
    onLogAdd('Database', 'success', `PDO UPDATE & INSERT: Transacción de venta registrada. Producto [${p.id}] ${p.name} comprado. Unidades reducidas en inventario.`);
    onLogAdd('API', 'info', `API endpoint ejecutado: /api.php/compras/registro?socio_id=${activeClient.id}`);
    
    setTimeout(() => {
      setPurchaseSuccess(null);
    }, 4500);
  };

  const triggerMockClassBooking = (cl: ClassSession) => {
    onBookClass(cl.id);
    setBookingSuccess(`¡Cupo reservado con éxito para ${cl.className}!`);
    onLogAdd('Database', 'success', `PDO UPDATE & INSERT: Nueva reserva creada en tabla \`reservas_clases\` para clase '${cl.className}' (Socio ID ${activeClient.id}).`);
    
    setTimeout(() => {
      setBookingSuccess(null);
    }, 4000);
  };

  return (
    <div className="space-y-8" id="socio_portal_root">
      {/* Simulation switch dropdown bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
        <div className="flex items-center space-x-2.5">
          <span className="text-base text-emerald-400">👤</span>
          <div>
            <p className="font-semibold text-white">Simular Socio Conectado</p>
            <p className="text-[10px] text-slate-500 font-mono">Espacio seguro de cliente</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-1.5 px-2.5 rounded-xl border border-slate-850">
          <span className="text-slate-400 font-medium">Socio Activo:</span>
          <select
            className="bg-slate-900 text-white font-semibold font-sans rounded-md px-2 py-1 focus:outline-none focus:border-emerald-500 border border-slate-800"
            value={selectedClientId}
            onChange={(e) => {
              const cid = Number(e.target.value);
              setSelectedClientId(cid);
              const cEntity = clients.find(cl => cl.id === cid);
              if (cEntity) {
                setWeightInput(cEntity.weight);
                setHeightInput(cEntity.height);
              }
            }}
          >
            {clients.map(c => {
              const cGym = gyms.find(g => g.id === c.gymId);
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({cGym?.name})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main split display: left: (Personal profile card & QR Entry) right: (Classes & Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="socio_dashboard_layout">
        {/* Left column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Ficha del socio general */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 p-5 opacity-5">
              <User size={130} className="text-white" />
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-sm tracking-tight">
                {activeClient.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">{activeClient.name}</h3>
                  <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                    activeClient.status === 'Activo'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {activeClient.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <span>🏢 Sede:</span>
                  <span className="text-white font-semibold">{activeGym.name}</span>
                </p>
              </div>
            </div>

            {/* Expiring bar indicator if active */}
            <div className="space-y-1.5 p-4 bg-slate-950 rounded-xl border border-slate-900 text-xs">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500 font-semibold uppercase">Membresía: {activePlan?.name || 'Recurrente Mensual'}</span>
                {daysLeft > 0 ? (
                  <span className="text-emerald-400 font-bold">{daysLeft} días restantes</span>
                ) : (
                  <span className="text-rose-400 font-semibold">Expirada</span>
                )}
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${daysLeft < 5 ? 'bg-amber-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min((daysLeft / 30) * 100, 100)}%` }}
                ></div>
              </div>

              <p className="text-[10px] text-slate-400 font-mono mt-2 flex justify-between">
                <span>Fecha inicial: {activeClient.membershipStart}</span>
                <span>Vencimiento: {activeClient.membershipEnd}</span>
              </p>
            </div>

            {/* QR access code badge simulating RFID */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 flex flex-col items-center justify-center py-5 space-y-3.5">
              <div className="relative p-3.5 bg-white rounded-lg inline-block shadow-inner">
                {/* Visual simulator of QR using Lucide, bordered cleanly */}
                <QrCode size={110} className="text-slate-900 animate-pulse" />
                <div className="absolute inset-0 bg-emerald-500/5 mix-blend-color animate-pulse rounded-lg"></div>
              </div>

              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono text-slate-500">PASE DIGITAL DE ACCESO ACCELERADO</span>
                <p className="font-mono text-xs text-emerald-400 font-bold">{activeClient.qrCode}</p>
                <div className="flex items-center gap-1 justify-center mt-1 text-[11px] font-sans">
                  {activeClient.status === 'Activo' ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                      <ShieldCheck size={11} /> ACCESO PERMITIDO (BARRERA ABIERTA)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[10px]">
                      ⚠️ ACCESO DENEGADO (RENOVAR MEMBRESÍA)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Biometrics readings and BMI indicator info */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <HeartPulse size={16} className="text-rose-400" />
                <span>Rendimiento & Control Biométrico</span>
              </h3>

              {!isEditingBiometrics ? (
                <button
                  onClick={() => {
                    setWeightInput(activeClient.weight);
                    setHeightInput(activeClient.height);
                    setIsEditingBiometrics(true);
                  }}
                  className="text-[10px] font-bold text-indigo-400 hover:text-white transition cursor-pointer"
                >
                  Modificar Medidas
                </button>
              ) : null}
            </div>

            {isEditingBiometrics ? (
              <form onSubmit={handleSaveBiometrics} className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-850">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-mono font-bold">Peso Corporal (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white w-full text-center"
                      value={weightInput}
                      onChange={(e) => setWeightInput(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-mono font-bold">Estatura (cm)</label>
                    <input
                      type="number"
                      required
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white w-full text-center"
                      value={heightInput}
                      onChange={(e) => setHeightInput(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsEditingBiometrics(false)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-md transition cursor-pointer"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-md hover:bg-emerald-600 transition cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-mono">ESTATURA</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">{activeClient.height} cm</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-mono">PESO ÚLTIMO</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">{activeClient.weight} kg</p>
                </div>
              </div>
            )}

            {/* BMI Display Strip */}
            <div className={`p-4 rounded-xl border border-slate-850 space-y-1.5 ${imcInfo.bg}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono font-medium">Auto-IMC Calculado:</span>
                <span className={`font-extrabold font-mono text-sm ${imcInfo.color}`}>{currentIMC} ({imcInfo.text})</span>
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed font-sans mt-1 flex items-start gap-1">
                <Info size={13} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>{imcInfo.desc}</span>
              </p>
            </div>

            <div className="text-[10px] text-slate-500 flex justify-between font-mono">
              <span>Factor sanguíneo: <strong>{activeClient.bloodType || 'Sin validar'}</strong></span>
              <span>Refresco: SQLite/MySQL Sync</span>
            </div>
          </div>
        </div>

        {/* Right column: Classes & Available location goods (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Notifications strip alert */}
          <AnimatePresence mode="wait">
            {purchaseSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <span>🛒</span>
                <span>{purchaseSuccess}</span>
              </motion.div>
            )}

            {bookingSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <span>🎯</span>
                <span>{bookingSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: Book Classes */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dumbbell size={16} className="text-emerald-400" />
              <span>Clases Disponibles de mi Sede (Horarios & Reserva)</span>
            </h3>

            <div className="divide-y divide-slate-805 space-y-3.5 max-h-[290px] overflow-auto pr-1">
              {currentGymClasses.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center bg-slate-950 rounded-xl border border-slate-900">
                  No hay clases de fitness activadas para su gimnasio en este momento.
                </p>
              ) : (
                currentGymClasses.map((cl, i) => {
                  const percent = (cl.currentReservations / cl.maxCapacity) * 100;
                  const isFull = cl.currentReservations >= cl.maxCapacity;

                  return (
                    <div key={cl.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-white text-xs">{cl.className}</p>
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                            {cl.roomName}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Instructor: <strong>{cl.trainerName}</strong></p>
                        <p className="text-[10px] text-emerald-400 font-mono">{cl.scheduleTime}</p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="space-y-1 text-right sm:text-left">
                          <span className="text-[10px] font-mono text-slate-400">Cupos: {cl.currentReservations}/{cl.maxCapacity}</span>
                          <div className="w-24 bg-slate-950 rounded-full h-1 mt-0.5">
                            <div className="h-1 bg-emerald-400 rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>

                        <button
                          onClick={() => triggerMockClassBooking(cl)}
                          disabled={isFull || activeClient.status !== 'Activo'}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-550 text-slate-950 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <span>🎯 Reservar</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Supplement Shop recommendations */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart size={16} className="text-amber-400" />
              <span>Tienda Interna Sede: Compra Rápida de Nutrición e Implementos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentGymProducts.length === 0 ? (
                <p className="col-span-2 text-slate-500 text-xs py-4 text-center bg-slate-950 rounded-xl border border-slate-900">
                  No hay stock de tienda online activado en este momento.
                </p>
              ) : (
                currentGymProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex flex-col justify-between hover:border-slate-800 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-slate-500 uppercase">{p.category}</span>
                          <span className={p.stock <= p.minStock ? 'text-amber-400' : 'text-slate-500'}>
                            {p.stock} unidades en stock
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white leading-normal line-clamp-1">{p.name}</h4>
                        <p className="text-[10px] text-slate-400">Proveedor: {p.supplier}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between mt-3">
                        <span className="text-sm font-bold text-emerald-400 font-mono">${p.price.toFixed(2)}</span>
                        <button
                          onClick={() => triggerMockBuy(p)}
                          disabled={isOutOfStock || activeClient.status !== 'Activo'}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-900 disabled:text-slate-600 text-slate-950 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          {isOutOfStock ? 'Sin stock' : 'Comprar Producto'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
