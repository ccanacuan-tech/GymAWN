/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { phpSourceFiles } from '../phpSourceCode';
import { Copy, Check, FileCode, CheckCircle2, CloudLightning, ShieldCheck, Terminal, Database, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PHPDeployerProps {
  onLogAdd: (service: 'Database' | 'Backup' | 'API' | 'Auth' | 'Security', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export default function PHPDeployer({ onLogAdd }: PHPDeployerProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Connection Tester States
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('3306');
  const [dbName, setDbName] = useState('gym_saas_db');
  const [dbUser, setDbUser] = useState('gym_user');
  const [dbPass, setDbPass] = useState('G1m_S3cur3_Pa$$1');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

  const activeFile = phpSourceFiles[selectedFileIdx];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    onLogAdd('Security', 'info', `Código fuente de '${phpSourceFiles[index].name}' copiado al portapapeles.`);
    setTimeout(() => {
      setCopiedIdx(null);
    }, 2000);
  };

  const simulateConnectionTest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult({ status: 'idle', message: '' });
    onLogAdd('Database', 'info', `Iniciando prueba de conexión tipo PDO en mysql:host=${dbHost};port=${dbPort};dbname=${dbName}...`);

    setTimeout(() => {
      setIsTesting(false);
      // Simulate successful result if password is not empty, otherwise simulate error
      if (dbHost === 'localhost' && dbUser && dbPass && dbName) {
        setTestResult({
          status: 'success',
          message: '¡Conexión PDO establecida con éxito! Escuchando hilos en MySQL v8.0.35 relacional, tablas multi-tenant validadas.',
        });
        onLogAdd('Database', 'success', `PDO Conexión exitosa a '${dbName}' bajo el host'${dbHost}'.`);
      } else {
        setTestResult({
          status: 'error',
          message: 'Error de PDOException (1045): Access denied for user. Comprueba la dirección del host y los privilegios de conexión.',
        });
        onLogAdd('Database', 'error', `PDO Exception a mysql:host=${dbHost}. Acceso denegado ó variables incorrectas.`);
      }
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="php_deployer_workspace">
      {/* LEFT COLUMN: File Explorer and Source Code (7 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Workspace Title Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>🛡️</span> <span>Código Fuente PHP & MySQL</span>
          </h2>
          <p className="text-xs text-slate-400">
            Copie y descargue estos archivos nativos listos para subir a cualquier servidor de alojamiento cPanel o Apache.
          </p>
        </div>

        {/* Source Code Container with tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-950/40 divide-x divide-slate-800/40">
            {phpSourceFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIdx(idx)}
                className={`px-3.5 py-2.5 text-xs font-mono font-medium flex items-center space-x-2 transition ${
                  selectedFileIdx === idx
                    ? 'bg-slate-900 text-emerald-400 font-semibold border-t-2 border-emerald-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <FileCode size={13} className={selectedFileIdx === idx ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          {/* Description sub-bar */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-850 flex items-center justify-between text-xs">
            <p className="text-slate-400 italic">
              <strong>Ubicación sugerida:</strong> <span className="font-mono text-white text-[11px] bg-slate-900 px-1.5 py-0.5 rounded ml-1">/public_html/{activeFile.path}</span>
            </p>
            <button
              onClick={() => handleCopy(activeFile.code, selectedFileIdx)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-800 text-[10px] flex items-center gap-1.5 ml-2 cursor-pointer transition font-mono"
            >
              {copiedIdx === selectedFileIdx ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Highlight Simulator Display Code Area */}
          <div className="flex-1 overflow-auto p-5 font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950 bg-gradient-to-b from-slate-950 to-slate-950/80 scrollbar-thin">
            <pre>
              <code>{activeFile.code}</code>
            </pre>
          </div>
        </div>

        {/* Requirements Warning Checklist */}
        <div className="p-6 bg-slate-900/45 border border-slate-800 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">
            Parámetros CHMOD de Seguridad (Recomendados)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 text-xs">
              <span className="font-bold text-emerald-400 font-mono text-sm leading-none block">0644 ó 0640</span>
              <span className="font-semibold text-white block mt-1.5">config.php</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Protección obligatoria de cables con credenciales en texto plano.</p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 text-xs">
              <span className="font-bold text-emerald-400 font-mono text-sm leading-none block">0755</span>
              <span className="font-semibold text-white block mt-1.5">/backups_archivos/</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Permisos de escritura para que PHP pueda escribir los respaldos en ZIP.</p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 text-xs">
              <span className="font-bold text-emerald-400 font-mono text-sm leading-none block">0644</span>
              <span className="font-semibold text-white block mt-1.5">api.php & index.php</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Lectura mundial autorizada para responder endpoints de modo dinámico.</p>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Database connection testing environment (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Credentials configuration testing widget */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Database size={16} />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Probar Conexión PDO PHP</h3>
          </div>
          
          <p className="text-xs text-slate-400 leading-normal">
            Simula el comportamiento de conexión de la librería <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-white">getDBConnection()</code> del archivo PHP.
          </p>

          <form onSubmit={simulateConnectionTest} className="space-y-3 text-xs" id="db_test_form">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">DB HOST</label>
              <input
                type="text"
                required
                className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 w-full text-white font-mono"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">DB NAME</label>
                <input
                  type="text"
                  required
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 w-full text-white font-mono"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">PORT</label>
                <input
                  type="text"
                  required
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 w-full text-white font-mono text-center"
                  value={dbPort}
                  onChange={(e) => setDbPort(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">DB USER</label>
              <input
                type="text"
                required
                className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 w-full text-white font-mono"
                value={dbUser}
                onChange={(e) => setDbUser(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">DB PASSWORD</label>
              <input
                type="password"
                required
                className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 w-full text-white font-mono"
                value={dbPass}
                onChange={(e) => setDbPass(e.target.value)}
              />
            </div>

            <button
              id="btn_test_db_conn"
              type="submit"
              disabled={isTesting}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              {isTesting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span className="font-sans">Testeando Conectividad...</span>
                </>
              ) : (
                <>
                  <CloudLightning size={14} />
                  <span className="font-sans">Probar Conexión PDO</span>
                </>
              )}
            </button>
          </form>

          {/* Connection Outcome block Display with presence animation */}
          <AnimatePresence mode="wait">
            {testResult.status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-4 rounded-xl border text-[11px] leading-relaxed ${
                  testResult.status === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-sm">{testResult.status === 'success' ? '⚡' : '⚠️'}</span>
                  <div>
                    <h4 className="font-bold">{testResult.status === 'success' ? 'PDO_SUCCESS' : 'PDO_ERROR'}</h4>
                    <p className="mt-1">{testResult.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Why relational? Card advantages */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-emerald-400" size={16} />
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Seguridad & Escalabilidad</h4>
          </div>
          <ul className="text-xs space-y-2.5 text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">⚡</span>
              <span><strong>PDO Contra SQL Injections:</strong> Consultas preparadas emulan parámetros desacoplados blindando lecturas no autorizadas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">⚡</span>
              <span><strong>Aislamiento Relacional:</strong> Diseñado con segregadores clave <code className="bg-slate-950 px-1 rounded text-emerald-400 font-mono">tenant_id</code> indizados para búsquedas rápidas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">⚡</span>
              <span><strong>Comodidad en Cómputo:</strong> Totalmente autónomo de librerías costosas, permitiendo latencias bajas en Apache básico.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
