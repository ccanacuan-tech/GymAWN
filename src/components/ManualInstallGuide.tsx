/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { installGuideMarkdown } from '../phpSourceCode';
import { BookOpen, CheckCircle, ArrowRight, ArrowLeft, Shield, Clock, HelpCircle, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

export default function ManualInstallGuide() {
  const [activeStep, setActiveStep] = useState(0);

  const stepsDetails = [
    {
      title: "Paso 1: Organizar Archivos",
      icon: "📁",
      short: "Descargue y cargue los archivos en el public_html del servidor.",
      desc: "Debe copiar los ficheros provistos en su servidor. Se alojan usualmente bajo public_html o el directorio raíz que indexe su dominio principal. Asegúrese de que la carpeta vacía 'backups_archivos/' tenga permisos de escritura directos por Apache o cPanel configurados.",
      code: `[Ruta public_html]
 │
 ├── config.php          <-- Configuración confidencial de host y pass
 ├── db_schema.sql       <-- Plano de tablas con datos demo seeders
 ├── api.php             <-- Endpoints CRUD multi-tenant (JSON)
 ├── backup.php          <-- Lanzador del respaldador automático
 ├── monitoring.php      <-- Telemetría e índices CHMOD
 ├── index.php           <-- Landing page responsiva del SaaS
 └── backups_archivos/   <-- CARPETA (Permisos 0755, para archivos ZIP)
`
    },
    {
      title: "Paso 2: Importar la Base de Datos",
      icon: "🗄️",
      short: "Cree la base de datos en cPanel e importe db_schema.sql.",
      desc: "Ingrese a phpMyAdmin en su cPanel. Cree una base de datos vacía (ej: 'gym_saas_db') y un usuario administrador (ej: 'gym_user'). Vaya a la sección 'Importar', elija 'db_schema.sql' y haga clic en continuar. Esto creará el árbol relacional multi-tenant de inmediato.",
      code: `-- Comando de importación alternativo por consola (SSH):
mysql -u gym_user -p gym_saas_db < db_schema.sql
`
    },
    {
      title: "Paso 3: Editar Conexiones config.php",
      icon: "⚙️",
      short: "Fije las credenciales de host, claves de paso y tokens de seguridad.",
      desc: "Abra el editor nativo de cPanel e ingrese a config.php. Rellene los parámetros de host, port, dbname, user, y password que configuró en phpMyAdmin. Cambie el entorno a 'production' y configure el token 'BACKUP_SECRET_TOKEN' por un valor confidencial y robusto.",
      code: `define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'tu_base_datos_creada');
define('DB_USER', 'tu_usuario_creado');
define('DB_PASS', 'tu_contrasena_segura');

define('APP_ENV', 'production'); // Oculta trazas sensibles en logs
`
    },
    {
      title: "Paso 4: Auditoría de CHMOD",
      icon: "🔒",
      short: "Fije permisos 0644 para config.php y 0755 para carpetas.",
      desc: "Los archivos que contienen credenciales en texto plano deben ser protegidos. Conceda CHMOD 0644 o 0640 en el administrador de archivos para que config.php no pueda ser leído libremente por agentes externos malintencionados.",
      code: `# Comando CHMOD alternativo vía consola SSH:
chmod 644 config.php
chmod 755 backups_archivos
`
    },
    {
      title: "Paso 5: Programar Respaldo Cron",
      icon: "⏰",
      short: "Configure una tarea cron diaria llamando a backup.php.",
      desc: "En la sección 'Tareas Cron' de cPanel, configure un intervalo diario (0 0 * * *). Agregue una llamada curl que apunte a backup.php pasando el token secreto de respaldo. Esto mantendrá archivadas copias diarias del MySQL autolimpiables al superar los 10 días.",
      code: `# Tarea Cron de cPanel Diaria
curl -s "https://tu-dominio-gym.com/backup.php?token=Backup_Secure_Token_123456" > /dev/null 2>&1
`
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="manual_install_guide_workspace">
      {/* Sidebar step indicators (4 cols) */}
      <div className="lg:col-span-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono pl-1">
          Etapas del Despliegue cPanel
        </h3>

        <div className="space-y-2">
          {stepsDetails.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`w-full p-4 rounded-2xl border text-left transition flex items-start space-x-3.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                activeStep === idx
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-lg leading-none mt-0.5">{step.icon}</span>
              <div className="space-y-0.5">
                <h4 className={`text-xs font-semibold ${activeStep === idx ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal">{step.short}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Support box info */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 text-xs leading-relaxed text-slate-400">
          <p className="font-semibold text-white flex items-center gap-1">
            <HelpCircle size={14} className="text-emerald-400" />
            <span>¿Soporta Apache básico?</span>
          </p>
          <p className="text-[11px] text-slate-500 leading-normal">
            Sí. Todo el código aprovecha PDO estándar con librerías nativas incorporadas en el core de PHP 8. No requiere instalar Node, Composer, o dependencias complicadas en el servidor final.
          </p>
        </div>
      </div>

      {/* Main Display step Details area (8 cols) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl">{stepsDetails[activeStep].icon}</span>
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-widest">Guía de instalación</span>
              <h2 className="text-lg font-bold text-white tracking-tight">{stepsDetails[activeStep].title}</h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-850">
            {stepsDetails[activeStep].desc}
          </p>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Ejemplo de código / Estructura del paso</p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              <pre>
                <code>{stepsDetails[activeStep].code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Wizard Footer controls */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-800/60 mt-8 text-xs font-semibold">
          <button
            onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))}
            disabled={activeStep === 0}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-900/10 disabled:text-slate-600 text-white rounded-xl border border-slate-850 transition flex items-center space-x-1.5 focus:outline-none"
          >
            <ArrowLeft size={13} />
            <span>Anterior</span>
          </button>

          <span className="text-slate-500 font-mono text-[11px]">{activeStep + 1} / {stepsDetails.length}</span>

          <button
            onClick={() => {
              if (activeStep < stepsDetails.length - 1) {
                setActiveStep(prev => prev + 1);
              }
            }}
            disabled={activeStep === stepsDetails.length - 1}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 rounded-xl transition flex items-center space-x-1.5 focus:outline-none"
          >
            <span>Siguiente</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
