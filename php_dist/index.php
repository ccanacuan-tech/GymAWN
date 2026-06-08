<?php
/**
 * Plataforma SaaS - GymAdmin - PANEL DE CONTROL BASE
 * Página de inicio rápida de bienvenida que interactúa con la base de datos para estadísticas.
 */

// Requerir conexión e intentar interactuar
require_once __DIR__ . '/config.php';

$errorDB = null;
$stats = [
    'gimnasios' => 0,
    'clientes' => 0,
    'membresias_activas' => 0,
    'ingresos_totales' => 0.00
];
$gimnasios = [];

try {
    $db = getDBConnection();
    
    // Obtener Conteo de Gimnasios inscritos
    $stats['gimnasios'] = $db->query("SELECT COUNT(*) FROM gimnasios")->fetchColumn();
    
    // Conteo Clientes Totales
    $stats['clientes'] = $db->query("SELECT COUNT(*) FROM clientes")->fetchColumn();
    
    // Membresías Activas
    $stats['membresias_activas'] = $db->query("SELECT COUNT(*) FROM clientes WHERE estado = 'Activo'")->fetchColumn();
    
    // Ingresos agregados
    $stats['ingresos_totales'] = (float)$db->query("SELECT SUM(monto_pagado) FROM membresias WHERE estado_pago = 'Pagado'")->fetchColumn();

    // Obtener los gimnasios listados
    $stmtG = $db->query("SELECT * FROM gimnasios ORDER BY id ASC");
    $gimnasios = $stmtG->fetchAll();

} catch (Exception $e) {
    $errorDB = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymAdmin - Servidor PHP Activo</title>
    <!-- Tailwind CSS CDN para renderizado web nativo y responsivo -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans">
    
    <!-- Barra de Navegación -->
    <header class="border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold text-lg">
                    <span>🏋️</span>
                </div>
                <span class="text-xl font-bold tracking-tight text-white">GymAdmin <span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-1">PHP Engine</span></span>
            </div>
            <div class="flex items-center space-x-4 text-sm text-slate-400">
                <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span> Servidor en Línea</span>
                <a href="monitoring.php" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition text-xs">Vitals Monitor</a>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <?php if ($errorDB): ?>
        <!-- Alerta de Error de Base de Datos -->
        <div class="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
            <span class="text-2xl">⚠️</span>
            <div>
                <h3 class="font-semibold text-red-400">Falla en Conexión a Base de Datos</h3>
                <p class="text-xs text-slate-400 mt-1">El servidor PHP funciona, pero no pudo conectar a MySQL. Comprueba la configuración de credenciales del archivo <code class="bg-slate-950 px-1 py-0.5 rounded text-red-300 font-mono text-xs">config.php</code>.</p>
                <p class="text-xs font-mono text-red-300 mt-2 bg-slate-950/50 p-2 rounded border border-red-500/10"><?php echo htmlspecialchars($errorDB); ?></p>
            </div>
        </div>
        <?php else: ?>
        
        <!-- Banner de Éxito -->
        <div class="mb-8 p-6 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-white tracking-tight">¡Bienvenido a GymAdmin SaaS!</h1>
                <p class="text-sm text-slate-400 mt-1">Instalación y conexión de base de datos MySQL inicializadas satisfactoriamente.</p>
            </div>
            <a href="api.php/health" target="_blank" class="self-start sm:self-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl text-xs transition duration-200">
                Verificar Endpoints API
            </a>
        </div>

        <!-- Bento Grid de Estadísticas -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            <!-- Gimnasios -->
            <div class="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl">
                <div class="text-slate-400 text-xs font-medium">Gimnasios Activos</div>
                <div class="text-3xl font-bold text-white mt-2"><?php echo $stats['gimnasios']; ?></div>
                <div class="text-xs text-slate-500 mt-1">Suscritos en la nube</div>
            </div>

            <!-- Clientes -->
            <div class="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl">
                <div class="text-slate-400 text-xs font-medium">Miembros Registrados</div>
                <div class="text-3xl font-bold text-white mt-2"><?php echo $stats['clientes']; ?></div>
                <div class="text-xs text-emerald-400 mt-1 font-medium">En todas las sucursales</div>
            </div>

            <!-- Membresías Activas -->
            <div class="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl">
                <div class="text-slate-400 text-xs font-medium">Miembros Activos</div>
                <div class="text-3xl font-bold text-white mt-2"><?php echo $stats['membresias_activas']; ?></div>
                <div class="text-xs text-slate-500 mt-1">Con acceso habilitado</div>
            </div>

            <!-- Ingresos Reales -->
            <div class="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-950/40 to-emerald-950/10">
                <div class="text-slate-400 text-xs font-medium">Recaudación Facturada</div>
                <div class="text-3xl font-bold text-emerald-400 mt-2">$<?php echo number_format($stats['ingresos_totales'], 2); ?></div>
                <div class="text-xs text-slate-500 mt-1">Pagos Procesados Online</div>
            </div>

        </div>

        <!-- Sección de Tenants de Prueba -->
        <div class="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl">
            <h2 class="text-lg font-semibold text-white mb-4">Gimnasios Habilitados (Tenants)</h2>
            <div class="grid md:grid-cols-2 gap-4">
                <?php foreach ($gimnasios as $g): ?>
                <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
                    <div class="flex items-center justify-between mb-3">
                        <span class="font-semibold text-white"><?php echo htmlspecialchars($g['nombre']); ?></span>
                        <span class="px-2 py-0.5 text-[10px] font-semibold border rounded-full <?php echo $g['estado'] === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'; ?>">
                            <?php echo $g['estado']; ?>
                        </span>
                    </div>
                    <div class="space-y-1.5 text-xs text-slate-400">
                        <p class="flex justify-between"><span>Subdominio:</span> <span class="font-mono text-emerald-400"><?php echo htmlspecialchars($g['subdominio']); ?>.gymadmin.saas</span></p>
                        <p class="flex justify-between"><span>Plan:</span> <span class="font-medium text-white"><?php echo $g['plan_suscripcion']; ?></span></p>
                        <p class="flex justify-between"><span>Email:</span> <span><?php echo htmlspecialchars($g['email']); ?></span></p>
                        <p class="flex justify-between"><span>Sede:</span> <span><?php echo htmlspecialchars($g['direccion'] ?? 'No registrada'); ?></span></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <?php endif; ?>

    </main>

    <!-- Footer -->
    <footer class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-800 text-center text-xs text-slate-500 mt-12">
        <p>Plataforma de Administración SaaS para Gimnasios © 2026. Todos los derechos reservados.</p>
        <p class="mt-2 text-slate-600">Diseñado mediante arquitectura multi-tenant de alto rendimiento con PHP 8 y MySQL.</p>
    </footer>

</body>
</html>
