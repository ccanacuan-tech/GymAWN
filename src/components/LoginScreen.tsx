/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gym, GymAdmin, Client } from '../types';
import { Database, Shield, User, Lock, Mail, ChevronRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  gyms: Gym[];
  gymAdmins: GymAdmin[];
  clients: Client[];
  onLogin: (role: 'super_admin' | 'gym_admin' | 'client', email: string, gymId: number, clientId: number) => void;
}

export default function LoginScreen({ gyms, gymAdmins, clients, onLogin }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'super_admin' | 'gym_admin' | 'client'>('gym_admin');
  const [emailInput, setEmailInput] = useState('carlos@megapower.fit');
  const [passwordInput, setPasswordInput] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTabChange = (tab: 'super_admin' | 'gym_admin' | 'client') => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'super_admin') {
      setEmailInput('admin@fit.com');
      setPasswordInput('admin');
    } else if (tab === 'gym_admin') {
      setEmailInput('carlos@megapower.fit');
      setPasswordInput('admin');
    } else {
      setEmailInput('juan.perez@email.com');
      setPasswordInput('client');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (activeTab === 'super_admin') {
      if (emailInput.toLowerCase() === 'admin@fit.com' && passwordInput === 'admin') {
        onLogin('super_admin', 'admin@fit.com', 1, 0);
      } else {
        setErrorMsg('Credenciales de Super Admin inválidas.');
      }
    } else if (activeTab === 'gym_admin') {
      // Find matching admin
      const matchingAdmin = gymAdmins.find(
        (adm) => adm.email.toLowerCase() === emailInput.toLowerCase().trim()
      );
      if (matchingAdmin && passwordInput === 'admin') {
        onLogin('gym_admin', matchingAdmin.email, matchingAdmin.gymId, 0);
      } else {
        setErrorMsg('Credenciales de Administrador de Sede incorrectas. Prueba carlos@megapower.fit con contraseña admin.');
      }
    } else if (activeTab === 'client') {
      // Find matching client
      const matchingClient = clients.find(
        (c) => c.email.toLowerCase() === emailInput.toLowerCase().trim()
      );
      if (matchingClient && passwordInput === 'client') {
        onLogin('client', matchingClient.email, matchingClient.gymId, matchingClient.id);
      } else {
        setErrorMsg('Credenciales de Socio incorrectas. Prueba juan.perez@email.com con contraseña client.');
      }
    }
  };

  // Helper selectors to login instantly
  const handleFastLogin = (role: 'super_admin' | 'gym_admin' | 'client', email: string, pass: string) => {
    setActiveTab(role);
    setEmailInput(email);
    setPasswordInput(pass);
    setErrorMsg('');
    
    // Auto submit values
    setTimeout(() => {
      if (role === 'super_admin' && email === 'admin@fit.com' && pass === 'admin') {
        onLogin('super_admin', 'admin@fit.com', 1, 0);
      } else if (role === 'gym_admin') {
        const matchingAdmin = gymAdmins.find(adm => adm.email.toLowerCase() === email.toLowerCase());
        if (matchingAdmin) {
          onLogin('gym_admin', matchingAdmin.email, matchingAdmin.gymId, 0);
        }
      } else if (role === 'client') {
        const matchingClient = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (matchingClient) {
          onLogin('client', matchingClient.email, matchingClient.gymId, matchingClient.id);
        }
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden" id="login_portal_root">
      {/* Decorative ambient blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 z-10" id="login_card_container">
        {/* Brand visual header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-2" id="login_brand_logo">
            <span className="text-2xl">🏋️‍♂️</span>
          </div>
          <h1 className="text-2xl font-bold font-sans text-white tracking-tight flex items-center justify-center space-x-2">
            <span>GymAdmin SaaS</span>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">REALTIME</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Plataforma ERP Segura con Aislamiento de Datos por Gimnasio (Multi-tenant)
          </p>
        </div>

        {/* Tab Role selection */}
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl grid grid-cols-3 gap-1" id="login_role_tabs">
          {[
            { id: 'gym_admin', label: 'Admin Sede', icon: <Database size={13} /> },
            { id: 'super_admin', label: 'Super Admin', icon: <Shield size={13} /> },
            { id: 'client', label: 'Socio Portal', icon: <User size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              type="button"
              className={`rounded-xl py-2 px-1.5 text-[11px] font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? activeTab === 'super_admin'
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-md font-bold'
                    : activeTab === 'client'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-md font-bold'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/40 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Login Form card */}
        <div className="bg-slate-900/80 border border-slate-850 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-md font-semibold text-white">
              {activeTab === 'super_admin' && 'Acceso Master de Infraestructura'}
              {activeTab === 'gym_admin' && 'Acceso del Administrador de Sede'}
              {activeTab === 'client' && 'Portal de Socios del Club'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {activeTab === 'super_admin' && 'Monitoreo global de servidores, respaldo SQL y creación de franquicias.'}
              {activeTab === 'gym_admin' && 'Gestión autónoma de socios, inscripciones, membresías, clases y productos.'}
              {activeTab === 'client' && 'Consulta de vigencia de membresía, reservas de clases colectivas y compras.'}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4" id="login_submit_form">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 flex items-start gap-1.5" role="alert" id="login_error_alert">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Correo Electrónico de Acceso</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  placeholder={activeTab === 'super_admin' ? 'admin@fit.com' : 'correo@gimnasio.com'}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 w-full text-xs text-white placeholder-slate-600 focus:outline-none transition font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Contraseña</label>
                <span className="text-[10px] text-slate-500">Demo segura</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">
                  <Lock size={14} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-10 py-2.5 w-full text-xs text-white focus:outline-none transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'super_admin'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/10 text-slate-950'
                  : activeTab === 'client'
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-amber-500/10'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10'
              }`}
              id="btn_login_submit"
            >
              <span>Ingresar al Sistema Seguro</span>
              <ChevronRight size={14} />
            </button>
          </form>
        </div>

        {/* Demo Fast Login helpers */}
        <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-2.5" id="fast_login_helper">
          <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            <Sparkles size={11} className="text-emerald-400" />
            <span>Accesos Directos (Cuentas de Prueba)</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => handleFastLogin('super_admin', 'admin@fit.com', 'admin')}
              className="px-3 py-1.5 bg-slate-950/40 hover:bg-indigo-550/10 border border-slate-800 hover:border-indigo-500/20 rounded-xl text-left text-[11px] text-slate-300 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 max-w-[85%] truncate">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0"></span>
                <span>Super Admin: <strong className="text-indigo-400">admin@fit.com</strong> (admin)</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono shrink-0">Génesis SaaS</span>
            </button>

            <button
              onClick={() => handleFastLogin('gym_admin', 'carlos@megapower.fit', 'admin')}
              className="px-3 py-1.5 bg-slate-950/40 hover:bg-emerald-550/10 border border-slate-800 hover:border-emerald-500/20 rounded-xl text-left text-[11px] text-slate-300 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 max-w-[85%] truncate">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                <span>Admin Sede Mega: <strong className="text-emerald-400">carlos@megapower.fit</strong> (admin)</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono shrink-0">Sede Megapower</span>
            </button>

            <button
              onClick={() => handleFastLogin('gym_admin', 'sandra@yogazen.fit', 'admin')}
              className="px-3 py-1.5 bg-slate-950/40 hover:bg-emerald-550/10 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-left text-[11px] text-slate-300 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 max-w-[85%] truncate">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                <span>Admin Sede Zen: <strong className="text-emerald-400">sandra@yogazen.fit</strong> (admin)</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono shrink-0">Sede YogaZen</span>
            </button>

            <button
              onClick={() => handleFastLogin('client', 'juan.perez@email.com', 'client')}
              className="px-3 py-1.5 bg-slate-950/40 hover:bg-amber-550/10 border border-slate-800 hover:border-amber-500/20 rounded-xl text-left text-[11px] text-slate-300 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 max-w-[85%] truncate">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></span>
                <span>Socio de Ejemplo: <strong className="text-amber-400 font-medium">juan.perez@email.com</strong> (client)</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono shrink-0">Mega Power Club</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
