/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ServerMetrics, BackupFile, LogEntry, Gym, Client, Plan } from '../types';
import { formatTime, generateMetrics } from '../utils';
import { Terminal, Shield, Save, RefreshCw, Cpu, Activity, Database, AlertCircle, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RealTimeMonitorProps {
  gyms: Gym[];
  clients: Client[];
  planes: Plan[];
  backups: BackupFile[];
  logs: LogEntry[];
  serverMetrics: ServerMetrics;
  onExecuteBackup: (newBackup: BackupFile) => void;
  onLogAdd: (service: 'Database' | 'Backup' | 'API' | 'Auth' | 'Security', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
}

export default function RealTimeMonitor({
  gyms,
  clients,
  planes,
  backups,
  logs,
  serverMetrics,
  onExecuteBackup,
  onLogAdd,
}: RealTimeMonitorProps) {
  
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupOutput, setBackupOutput] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Trigger automated backup emulation
  const handleSimulateBackup = () => {
    setIsBackingUp(true);
    setBackupOutput(null);
    onLogAdd('Backup', 'info', 'Lanzando disparador de backup.php?token=Backup_Secure_Token_123456 por Cron...');

    setTimeout(() => {
      // Create new backup file entity
      const timestamp = new Date();
      const pad = (num: number) => num.toString().padStart(2, '0');
      const stampStr = `${timestamp.getFullYear()}${pad(timestamp.getMonth()+1)}${pad(timestamp.getDate())}_${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(timestamp.getSeconds())}`;
      
      const filename = `respaldo_${stampStr}.zip`;
      const kbSize = parseFloat((95.5 + Math.random() * 40).toFixed(2));
      const totalTables = 8;

      const newBackup: BackupFile = {
        id: `back-${Date.now()}`,
        filename,
        createdAt: formatTime(timestamp),
        sizeKb: kbSize,
        tablesCount: totalTables,
        status: 'Completado',
      };

      onExecuteBackup(newBackup);
      setIsBackingUp(false);

      const jsonStringResult = JSON.stringify({
        status: "success",
        message: "Respaldo generado con total éxito.",
        data: {
          archivo_creado: filename,
          tamano_kb: kbSize,
          tablas_procesadas: totalTables,
          archivos_antiguos_purgados: Math.random() > 0.5 ? 1 : 0,
          fecha_creado: formatTime(timestamp)
        }
      }, null, 2);

      setBackupOutput(jsonStringResult);
      onLogAdd('Backup', 'success', `Copia comprimida ZIP guardada en ./backups_archivos/${filename} (${kbSize} KB)`);
      
      // Auto trigger sql file generation and download simulation for testing purposes
      downloadSQLBackupSimulation(filename);
    }, 2000);
  };

  // Helper function to export SQL script live to the user as a download
  const downloadSQLBackupSimulation = (filename: string) => {
    try {
      const sqlText = `-- ==========================================================\n` +
                      `-- RESPALDO AUTOMÁTCO GYM_SAAS_DB EXPORTADO DESDE EL MONITOR\n` +
                      `-- Generado el: ${new Date().toISOString()}\n` +
                      `-- Sede principal de control\n` +
                      `-- ==========================================================\n\n` +
                      `SET FOREIGN_KEY_CHECKS=0;\n\n` +
                      `DROP TABLE IF EXISTS \`gimnasios\`;\n` +
                      `CREATE TABLE \`gimnasios\` (id INT, nombre VARCHAR(100));\n` +
                      `INSERT INTO \`gimnasios\` VALUES (1, 'Mega Power Gym'), (2, 'Yoga & Zen Studio');\n\n` +
                      `SET FOREIGN_KEY_CHECKS=1;\n`;
      const blob = new Blob([sqlText], { type: 'text/sql' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = filename.replace('.zip', '.sql');
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8" id="real_time_monitor_view">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vitals KPI 1: CPU */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">PHP CPU Usage</span>
            <Cpu className="text-emerald-400" size={14} />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-white">{serverMetrics.cpuUsage}%</span>
            <span className="text-[10px] text-emerald-400 font-mono">Bajo Consumo</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="h-1 bg-emerald-400 rounded-full" style={{ width: `${serverMetrics.cpuUsage * 4}%` }}></div>
          </div>
        </div>

        {/* Vitals KPI 2: Memory */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">RAM Peak (PHP)</span>
            <Activity className="text-emerald-400" size={14} />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-white">{serverMetrics.memoryUsage} MB</span>
            <span className="text-[10px] text-slate-500">De 512MB límite</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="h-1 bg-emerald-500 rounded-full" style={{ width: `${(serverMetrics.memoryUsage / 512) * 100}%` }}></div>
          </div>
        </div>

        {/* Vitals KPI 3: Latency */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Query Latency</span>
            <span className="text-emerald-400 text-xs font-mono">PDO</span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-white">{serverMetrics.responseTimeMs} ms</span>
            <span className="text-[10px] text-emerald-400 font-mono">Excelente</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="h-1 bg-sky-400 rounded-full" style={{ width: `${(serverMetrics.responseTimeMs / 50) * 100}%` }}></div>
          </div>
        </div>

        {/* Vitals KPI 4: Active Connections */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">MySQL SQL Connections</span>
            <Database className="text-emerald-400" size={14} />
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-white">{serverMetrics.activeConnections}</span>
            <span className="text-[10px] text-slate-500">Hilos abiertos</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="h-1 bg-amber-400 rounded-full" style={{ width: `${(serverMetrics.activeConnections / 20) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main split: Terminal and automatic backups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="vitals_split_area">
        {/* Terminal logs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Terminal size={16} className="text-emerald-400" />
              <span>Bitácora de Terminal en Tiempo Real (SysLogs)</span>
            </h3>
            
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Refresco automático</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-8 h-4 rounded-full p-0.5 transition cursor-pointer ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-850'}`}
              >
                <div className={`w-3 h-3 bg-slate-950 rounded-full transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          {/* Code logs window console */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 font-mono text-[10.5px] h-[360px] overflow-auto flex flex-col justify-between flex-col-reverse shadow-inner">
            <div className="space-y-2">
              {logs.slice().reverse().map((log) => {
                const colorCode =
                  log.level === 'success'
                    ? 'text-emerald-400'
                    : log.level === 'warn'
                    ? 'text-amber-400'
                    : log.level === 'error'
                    ? 'text-rose-400'
                    : 'text-indigo-400';

                return (
                  <div key={log.id} className="flex items-start space-x-2 border-b border-slate-900/40 pb-1.5 last:border-none">
                    <span className="text-slate-600">[{log.timestamp}]</span>
                    <span className={`font-semibold ${colorCode}`}>[{log.service}]</span>
                    <span className="text-slate-300 leading-normal">{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono text-right">
            <span>Escuchando transacciones PDO en localhost:3306...</span>
          </div>
        </div>

        {/* Backup configuration and archives (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action launcher box */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Save size={16} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Script de Respaldo Expreso</h3>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Dispara el script <code className="bg-slate-950 px-1 py-0.5 rounded text-[11px] font-mono text-white">backup.php</code> de forma remota. Generará un volcado SQL y descargará el archivo comprimido.
            </p>

            <button
              id="btn_trigger_backup_script"
              onClick={handleSimulateBackup}
              disabled={isBackingUp}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-slate-950" />
                  <span className="font-sans">Ejecutando backup.php...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span className="font-sans">Lanzar Respaldo Automático (ZIP)</span>
                </>
              )}
            </button>

            {/* Display output responses */}
            <AnimatePresence>
              {backupOutput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2 mt-4"
                >
                  <p className="text-[10px] uppercase font-bold text-slate-500 font-mono flex items-center gap-1">
                    <Check size={10} className="text-emerald-400" />
                    <span>Respuesta JSON del Servidor</span>
                  </p>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[9px] text-emerald-400 overflow-x-auto max-h-[140px]">
                    <pre>{backupOutput}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Backup logs archives list */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
              Bitácora de Respaldos Realizados
            </h4>

            <div className="space-y-2.5 max-h-[180px] overflow-auto pr-1">
              {backups.map((bk) => (
                <div key={bk.id} className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white truncate w-44">{bk.filename}</p>
                    <p className="text-[9px] text-slate-400">{bk.createdAt} • {bk.sizeKb} KB</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    ZIP OK
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-[9.5px] text-slate-500 leading-normal mb-0 italic">
              * Nota: El purgado de archivos antiguos entra en vigor automáticamente al superar los 10 días de antigüedad para proteger la cuota de espacio en disco del servidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
