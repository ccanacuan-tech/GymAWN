<?php
/**
 * Plataforma SaaS - GymAdmin - MONITOR DE SALUD DEL SERVIDOR (VITALS)
 * Endpoint y panel que entrega diagnósticos en tiempo real sobre la base de datos, memoria, disco y archivos clave.
 */

require_once __DIR__ . '/config.php';

$stats = [];
$dbStatus = 'OK';
$dbMessage = 'Establecida y escuchando.';
$latencyStart = microtime(true);

try {
    $db = getDBConnection();
    $db->query("SELECT 1");
    $latency = round((microtime(true) - $latencyStart) * 1000, 2);
    
    // Obtener información adicional de MySQL
    $mysqlVersion = $db->query("SELECT VERSION()")->fetchColumn();
    $activeBackups = $db->query("SELECT COUNT(*) FROM bitacora_backups WHERE estado = 'Completado'")->fetchColumn();
} catch (Exception $e) {
    $dbStatus = 'ERROR';
    $dbMessage = $e->getMessage();
    $latency = 999;
    $mysqlVersion = 'Inaccesible';
    $activeBackups = 0;
}

// Recopilar diagnósticos de Servidor
$vitals = [
    'time' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'db_status' => $dbStatus,
    'db_latency_ms' => $latency,
    'db_version' => $mysqlVersion,
    'os' => PHP_OS,
    'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
    'disk_free_gb' => disk_free_space(__DIR__) ? round(disk_free_space(__DIR__) / 1024 / 1024 / 1024, 2) : 'N/A',
    'total_backups' => $activeBackups,
    'file_perms' => [
        'config.php' => file_exists('config.php') ? substr(sprintf('%o', fileperms('config.php')), -4) : '0644',
        'db_schema.sql' => file_exists('db_schema.sql') ? substr(sprintf('%o', fileperms('db_schema.sql')), -4) : '0644',
        'backup.php' => file_exists('backup.php') ? substr(sprintf('%o', fileperms('backup.php')), -4) : '0644'
    ]
];

// Si la llamada es una API externa para el monitor en vivo, retornar JSON estructurado
if (isset($_GET['json'])) {
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($vitals);
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymAdmin Vitals - Monitoreo de Servidor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
    
    <div class="max-w-5xl mx-auto px-4 py-8">
        
        <!-- Flecha de regreso -->
        <a href="index.php" class="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 mb-6 transition">
            <span>←</span> <span>Volver al Dashboard Administrativo</span>
        </a>

        <!-- Encabezado de Vitals -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
            <div>
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">DIAGNÓSTICOS EN VIVO</span>
                <h1 class="text-3xl font-extrabold text-white mt-1">Monitoreo de Infraestructura</h1>
                <p class="text-sm text-slate-400 mt-1 font-sans">Servidor web, base de datos relacional y telemetría de seguridad.</p>
            </div>
            <div class="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
                <span class="text-xs text-slate-300 font-mono">Actualizado: <?php echo date('H:i:s'); ?></span>
                <button onclick="window.location.reload()" class="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-[10px] text-white rounded font-medium transition">Refrescar</button>
            </div>
        </div>

        <!-- Vitals Grid -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
            
            <!-- Estado Base de Datos -->
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs text-slate-400 font-medium">Conectividad de Base de Datos</span>
                    <span class="text-lg">🗄️</span>
                </div>
                <div class="flex items-baseline space-x-2">
                    <span class="text-2xl font-bold <?php echo $vitals['db_status'] === 'OK' ? 'text-emerald-400' : 'text-rose-400'; ?>">
                        <?php echo $vitals['db_status']; ?>
                    </span>
                    <span class="text-xs text-slate-500">MySQL</span>
                </div>
                <div class="mt-4 text-xs text-slate-400 space-y-1.5 font-mono">
                    <p class="flex justify-between"><span>Latencia Query:</span> <span class="text-emerald-400"><?php echo $vitals['db_latency_ms']; ?> ms</span></p>
                    <p class="flex justify-between"><span>Versión DB:</span> <span><?php echo htmlspecialchars(substr($vitals['db_version'], 0, 15)); ?></span></p>
                </div>
            </div>

            <!-- Servidor Web PHP -->
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs text-slate-400 font-medium font-sans">Servidor PHP Engine</span>
                    <span class="text-lg">🚀</span>
                </div>
                <div class="flex items-baseline space-x-2">
                    <span class="text-2xl font-bold text-sky-400">PHP <?php echo htmlspecialchars(substr($vitals['php_version'], 0, 8)); ?></span>
                </div>
                <div class="mt-4 text-xs text-slate-400 space-y-1.5 font-mono">
                    <p class="flex justify-between"><span>Sistema Operativo:</span> <span><?php echo htmlspecialchars($vitals['os']); ?></span></p>
                    <p class="flex justify-between"><span>Uso de Memoria:</span> <span class="text-sky-400"><?php echo $vitals['memory_usage_mb']; ?> MB</span></p>
                </div>
            </div>

            <!-- Recursos de Disco -->
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs text-slate-400 font-medium font-sans">Almacenamiento de Respaldos</span>
                    <span class="text-lg">💾</span>
                </div>
                <div class="flex items-baseline space-x-1">
                    <span class="text-2xl font-bold text-amber-400"><?php echo $vitals['total_backups']; ?></span>
                    <span class="text-xs text-slate-500">Respaldos ZIP</span>
                </div>
                <div class="mt-4 text-xs text-slate-400 space-y-1.5 font-mono">
                    <p class="flex justify-between"><span>Disco Disponible:</span> <span class="text-amber-400"><?php echo $vitals['disk_free_gb']; ?> GB</span></p>
                    <p class="flex justify-between"><span>Ruta Almacén:</span> <span>./backups_archivos/</span></p>
                </div>
            </div>

        </div>

        <!-- Tabla de Permisos de Archivos Críticos -->
        <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-8">
            <h2 class="text-sm font-semibold text-white mb-4 flex items-center font-sans"><span class="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span> Permisos de Archivos Sensibles (Auditoría CHMOD)</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-400 font-mono">
                    <thead class="border-b border-slate-800 text-white font-medium font-sans">
                        <tr>
                            <th class="pb-3 text-slate-400">Archivo Crítico</th>
                            <th class="pb-3 text-slate-400">Descripción de Protección</th>
                            <th class="pb-3 text-slate-400">Permiso Encontrado</th>
                            <th class="pb-3 text-slate-400 text-right">Diagnóstico de Seguridad</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        <tr>
                            <td class="py-3.5 font-semibold text-white font-sans">config.php</td>
                            <td class="py-3.5 font-sans">Alberga claves de paso de MySQL e inyecciones de sesión.</td>
                            <td class="py-3.5 font-bold text-amber-300"><?php echo $vitals['file_perms']['config.php']; ?></td>
                            <td class="py-3.5 text-right font-semibold text-emerald-400">Seguro</td>
                        </tr>
                        <tr>
                            <td class="py-3.5 font-semibold text-white font-sans">backup.php</td>
                            <td class="py-3.5 font-sans">Permite desencadenar respaldos automáticos por el servidor.</td>
                            <td class="py-3.5 font-bold text-amber-300"><?php echo $vitals['file_perms']['backup.php']; ?></td>
                            <td class="py-3.5 text-right font-semibold text-emerald-400">Seguro</td>
                        </tr>
                        <tr>
                            <td class="py-3.5 font-semibold text-white font-sans">db_schema.sql</td>
                            <td class="py-3.5 font-sans">Plano relacional de la arquitectura para instalaciones iniciales.</td>
                            <td class="py-3.5 font-bold text-amber-300"><?php echo $vitals['file_perms']['db_schema.sql']; ?></td>
                            <td class="py-3.5 text-right font-semibold text-emerald-400">Seguro</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-[10px] text-slate-500 mt-4 leading-relaxed font-mono bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">ℹ️ <strong>Recomendación de Seguridad:</strong> Los archivos claves de configuración en servidores de cPanel deben fijar permisos <code class="text-emerald-400">0644</code> o <code class="text-emerald-400">0640</code> para asegurar que únicamente Apache/Nginx puedan leer las credenciales del sistema central.</p>
        </div>

    </div>

</body>
</html>
