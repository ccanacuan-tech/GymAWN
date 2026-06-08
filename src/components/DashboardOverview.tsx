/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gym, Client, ProductInventory, Plan } from '../types';
import { Users, Building2, TrendingUp, AlertTriangle, Activity, CreditCard, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardOverviewProps {
  gyms: Gym[];
  clients: Client[];
  products: ProductInventory[];
  planes: Plan[];
  activeGymId: number;
  setActiveGymId: (id: number) => void;
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({
  gyms,
  clients,
  products,
  planes,
  activeGymId,
  setActiveGymId,
  onNavigate,
}: DashboardOverviewProps) {
  
  // Computations
  const activeGym = gyms.find(g => g.id === activeGymId) || gyms[0];
  const gymClients = clients.filter(c => c.gymId === activeGymId);
  const activeClients = gymClients.filter(c => c.status === 'Activo');
  const criticalProducts = products.filter(p => p.gymId === activeGymId && p.stock <= p.minStock);

  // Calculate MRR (Monthly Recurring Revenue)
  // For simplicity, sum active memberships under this gym
  const mrr = gymClients
    .filter(c => c.status === 'Activo')
    .reduce((all, client) => {
      const plan = planes.find(p => p.id === client.planId);
      if (!plan) return all;
      // Normalise monthly
      return all + (plan.price / plan.durationMonths);
    }, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="space-y-8" id="dashboard_overview_container">
      {/* Header and Tenant Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold font-mono">
              Entorno Multitenant PHPActivo
            </span>
            <span className="flex items-center text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
              PDO MySQL Online
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Consola de Administración SaaS Gimnasios
          </h1>
          <p className="text-sm text-slate-400">
            Monitoree y gestione sucursales estructuradas en tablas relacionales listas para producción.
          </p>
        </div>

        {/* Tenant Selector Switcher */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-800 self-start md:self-auto">
          <label className="text-xs font-medium text-slate-400 pl-2">Gimnasio Activo:</label>
          <select
            id="gym_tenant_selector"
            className="bg-slate-900 text-white text-xs border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 transition font-medium"
            value={activeGymId}
            onChange={(e) => setActiveGymId(Number(e.target.value))}
          >
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>
                🏢 {g.name} ({g.planType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Counters */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        id="stat_cards_grid"
      >
        {/* KPI 1: Clientes */}
        <motion.div
          variants={itemVariants}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition duration-200"
          id="stat_card_clients"
        >
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium font-mono">Socios en Sede</span>
            <div className="text-3xl font-extrabold text-white">{gymClients.length}</div>
            <div className="text-xs text-emerald-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5"></span>
              {activeClients.length} Activos vigentes
            </div>
          </div>
          <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl">
            <Users size={20} />
          </div>
        </motion.div>

        {/* KPI 2: MRR Estimado */}
        <motion.div
          variants={itemVariants}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition duration-200"
          id="stat_card_mrr"
        >
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium font-mono">Facturación SaaS / Mes</span>
            <div className="text-3xl font-extrabold text-emerald-400">${mrr.toFixed(2)}</div>
            <div className="text-xs text-slate-400">Estimado recurrente</div>
          </div>
          <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </motion.div>

        {/* KPI 3: Stock de Productos */}
        <motion.div
          variants={itemVariants}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition duration-200"
          id="stat_card_stock"
        >
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium font-mono">Productos en Tienda</span>
            <div className="text-3xl font-extrabold text-white">
              {products.filter(p => p.gymId === activeGymId).length}
            </div>
            {criticalProducts.length > 0 ? (
              <div className="text-xs text-rose-400 flex items-center font-medium">
                <AlertTriangle size={12} className="mr-1.5 text-rose-400 animate-pulse" />
                {criticalProducts.length} con stock bajo
              </div>
            ) : (
              <div className="text-xs text-slate-500">Todo el inventario óptimo</div>
            )}
          </div>
          <div className="p-3 bg-slate-950 text-rose-400 border border-slate-800 rounded-xl">
            <AlertTriangle size={20} />
          </div>
        </motion.div>

        {/* KPI 4: Info Plan Tenant */}
        <motion.div
          variants={itemVariants}
          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition duration-200"
          id="stat_card_plan"
        >
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium font-mono">Suscripción SaaS</span>
            <div className="text-xl font-bold text-white uppercase tracking-tight">{activeGym.planType}</div>
            <div className="text-xs text-slate-500">Subdominio: {activeGym.subdomain}.fit</div>
          </div>
          <div className="p-3 bg-slate-950 text-sky-400 border border-slate-800 rounded-xl">
            <Building2 size={20} />
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid: Interactive actions & Active Gym Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_details_grid">
        {/* Left Columns - Quick Operations & Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gym Information overview */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-semibold text-white flex items-center space-x-2">
                <span>📋</span> <span>Información de Ficha del Tenant</span>
              </h2>
              <span className="px-2.5 py-1 text-[10px] uppercase font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-full">
                {activeGym.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <p className="text-slate-500 font-sans">Nombre Oficial del Gimnasio</p>
                <p className="text-white font-semibold text-sm mt-1">{activeGym.name}</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <p className="text-slate-500 font-sans">Subdominio para Acceso PHP</p>
                <p className="text-emerald-400 font-mono text-sm mt-1">{activeGym.subdomain}.gymadmin.saas</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <p className="text-slate-500 font-sans">Dirección Física Registrada</p>
                <p className="text-white mt-1 text-xs truncate leading-relaxed">{activeGym.address}</p>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
                <p className="text-slate-500 font-sans">Contacto de Administración</p>
                <p className="text-white mt-1 text-xs">{activeGym.phone} • {activeGym.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <h2 className="text-md font-semibold text-white mb-4">Acciones de Despliegue Rápido</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                id="btn_shortcut_deploy"
                onClick={() => onNavigate('deploy')}
                className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition text-xs space-y-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md inline-block">🚀</span>
                <p className="font-semibold text-white">Código PHP/MySQL</p>
                <p className="text-[10px] text-slate-500 leading-normal">Descargue config.php, api.php, sql schema e index para el cPanel.</p>
              </button>

              <button
                id="btn_shortcut_stats"
                onClick={() => onNavigate('saas')}
                className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition text-xs space-y-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-md inline-block">👥</span>
                <p className="font-semibold text-white">Administración de Socios</p>
                <p className="text-[10px] text-slate-500 leading-normal">Alta y modificación de clientes, IMC, peso, estaturas, planes.</p>
              </button>

              <button
                id="btn_shortcut_monitor"
                onClick={() => onNavigate('monitor')}
                className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition text-xs space-y-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-md inline-block">📈</span>
                <p className="font-semibold text-white">Monitor Vitals</p>
                <p className="text-[10px] text-slate-500 leading-normal">Simule conexiones de base de datos relacional y respaldos en ZIP.</p>
              </button>
            </div>
          </div>

        </div>

        {/* Right side - Critical low-stock products & expiring memberships alerts */}
        <div className="space-y-6">
          {/* Expiration warning box */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Alertas de Vencimiento
            </h3>
            
            <div className="space-y-3" id="expiration_alerts_list">
              {gymClients.filter(c => c.status === 'Vencido').length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-4">No hay membresías vencidas en este tenant</div>
              ) : (
                gymClients.filter(c => c.status === 'Vencido').map((client) => {
                  const plan = planes.find(p => p.id === client.planId);
                  return (
                    <div
                      key={client.id}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="text-white text-xs font-semibold">{client.name}</p>
                        <p className="text-[10px] text-slate-400">Plan: {plan?.name || 'Suscripción Básica'}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 rounded-md">
                        EXPIRÓ
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stock status side summary */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Abastecimiento de Tienda
            </h3>

            <div className="space-y-3" id="stock_status_list">
              {products.filter(p => p.gymId === activeGymId).slice(0, 3).map((p) => {
                const percent = Math.min((p.stock / p.minStock) * 100, 100);
                const isLow = p.stock <= p.minStock;

                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{p.name}</span>
                      <span className={isLow ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                        {p.stock} pz (Min {p.minStock})
                      </span>
                    </div>
                    {/* Tiny Progress bar */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(percent, 10)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
