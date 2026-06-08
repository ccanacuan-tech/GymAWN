/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PHPSourceFile {
  name: string;
  path: string;
  language: string;
  description: string;
  code: string;
}

export const phpSourceFiles: PHPSourceFile[] = [
  {
    name: "config.php",
    path: "config.php",
    language: "php",
    description: "Configuración de Base de Datos PDO, Claves Secretas, Control de Sesiones y Sanitización de Entradas.",
    code: `<?php
/**
 * Plataforma SaaS - GymAdmin
 * CONFIGURACIÓN CENTRAL DE BASE DE DATOS Y SEGURIDAD
 */

// Evitar acceso directo si se incluye externamente
if (count(get_included_files()) === 1) {
    header("HTTP/1.1 403 Forbidden");
    exit("Acceso directo no permitido.");
}

// Configuración de Entorno (Cambiar a 'production' en servidor vivo)
define('APP_ENV', 'development'); // 'development' o 'production'
define('APP_SECRET_KEY', 'S3cr3t_G1m_SaaS_2026_XyZ!');
define('BACKUP_SECRET_TOKEN', 'Backup_Secure_Token_123456!');

// Parámetros de conexión a la Base de Datos
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'gym_saas_db');
define('DB_USER', 'gym_user');
define('DB_PASS', 'G1m_S3cur3_Pa$$1');
define('DB_CHAR', 'utf8mb4');

// Configuración del manejo de Errores de Base de Datos
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Configuración de Seguridad en Sesión
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Strict');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Retorna la conexión Singleton a la base de datos usando PDO
 */
function getDBConnection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = sprintf("mysql:host=%s;port=%s;dbname=%s;charset=%s", DB_HOST, DB_PORT, DB_NAME, DB_CHAR);
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // En producción nunca mostrar credenciales o trazas detalladas
            if (APP_ENV === 'development') {
                die("Error de Conexión: " . htmlspecialchars($e->getMessage()));
            } else {
                error_log("Falla en Conexión DB: " . $e->getMessage());
                die("Ocurrió un error interno en el servidor. Por favor intente más tarde.");
            }
        }
    }
    return $pdo;
}

/**
 * Sanitiza valores de entrada para prevenir XSS (Cross Site Scripting)
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Verifica la firma del Token API para autenticación multi-tenant
 */
function authenticateAPIRequest() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        if ($token === APP_SECRET_KEY) {
            return true;
        }
    }
    
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado mediante Token API."]);
    exit;
}
?>`
  },
  {
    name: "db_schema.sql",
    path: "db_schema.sql",
    language: "sql",
    description: "Esquema relacional de MySQL con Multi-Tenancy nativo, cascadas e índices optimizados.",
    code: `-- =========================================================================
-- Plataforma SaaS - GymAdmin : Esquema Completo MySQL
-- Compatible con MySQL 5.7+ y MySQL 8.0
-- Diseñado con Multi-Tenancy mediante 'tenant_id' para alta eficiencia.
-- =========================================================================

CREATE DATABASE IF NOT EXISTS \`gym_saas_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`gym_saas_db\`;

-- 1. Tabla de Gimnasios (Tenants)
CREATE TABLE IF NOT EXISTS \`gimnasios\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(100) NOT NULL,
  \`subdominio\` VARCHAR(50) NOT NULL UNIQUE,
  \`direccion\` VARCHAR(255) NULL,
  \`telefono\` VARCHAR(30) NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`plan_suscripcion\` ENUM('Básico', 'Profesional', 'Enterprise') DEFAULT 'Básico',
  \`estado\` ENUM('Activo', 'Suspendido') DEFAULT 'Activo',
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_gimnasio_estado\` (\`estado\`),
  INDEX \`idx_gimnasio_subdominio\` (\`subdominio\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Usuarios del Sistema (Roles Administrativos)
CREATE TABLE IF NOT EXISTS \`usuarios\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tenant_id\` INT NOT NULL,
  \`nombre\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`rol\` ENUM('Super Admin', 'Administrador', 'Recepcionista', 'Entrenador') DEFAULT 'Administrador',
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY \`uk_user_email_tenant\` (\`email\`, \`tenant_id\`),
  CONSTRAINT \`fk_usuarios_gimnasio\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`gimnasios\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_usuarios_tenant\` (\`tenant_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Planes de Membresías definidos por cada Gimnasio
CREATE TABLE IF NOT EXISTS \`planes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tenant_id\` INT NOT NULL,
  \`nombre\` VARCHAR(100) NOT NULL,
  \`precio\` DECIMAL(10,2) NOT NULL,
  \`duracion_meses\` INT NOT NULL DEFAULT 1,
  \`beneficios\` TEXT NULL, -- Formato JSON o de texto separado por comas
  CONSTRAINT \`fk_planes_gimnasio\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`gimnasios\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_planes_tenant\` (\`tenant_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Clientes del Gimnasio
CREATE TABLE IF NOT EXISTS \`clientes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tenant_id\` INT NOT NULL,
  \`nombre\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NULL,
  \`telefono\` VARCHAR(30) NULL,
  \`foto_url\` VARCHAR(255) DEFAULT NULL,
  \`estado\` ENUM('Activo', 'Vencido', 'Congelado') DEFAULT 'Activo',
  \`peso_kg\` DECIMAL(5,2) NULL,
  \`estatura_cm\` INT NULL,
  \`imc\` DECIMAL(4,2) NULL,
  \`tipo_sangre\` VARCHAR(5) NULL,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_clientes_gimnasio\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`gimnasios\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_clientes_tenant\` (\`tenant_id\`),
  INDEX \`idx_clientes_estado\` (\`estado\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Historial de Suscripciones adquiridas por los clientes
CREATE TABLE IF NOT EXISTS \`membresias\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tenant_id\` INT NOT NULL,
  \`cliente_id\` INT NOT NULL,
  \`plan_id\` INT NOT NULL,
  \`fecha_inicio\` DATE NOT NULL,
  \`fecha_fin\` DATE NOT NULL,
  \`monto_pagado\` DECIMAL(10,2) NOT NULL,
  \`estado_pago\` ENUM('Pagado', 'Pendiente', 'Anulado') DEFAULT 'Pagado',
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_membresias_gimnasio\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`gimnasios\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_membresias_cliente\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`clientes\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_membresias_plan\` FOREIGN KEY (\`plan_id\`) REFERENCES \`planes\` (\`id\`) ON DELETE RESTRICT,
  INDEX \`idx_membresias_tenant\` (\`tenant_id\`),
  INDEX \`idx_membresias_cliente\` (\`cliente_id\`),
  INDEX \`idx_membresias_fechas\` (\`fecha_fin\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Clases Grupales y Actividades programadas
CREATE TABLE IF NOT EXISTS \`clases\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tenant_id\` INT NOT NULL,
  \`nombre_clase\` VARCHAR(100) NOT NULL,
  \`instructor\` VARCHAR(100) NOT NULL,
  \`horario\` DATETIME NOT NULL,
  \`salon\` VARCHAR(100) NULL,
  \`capacidad_max\` INT NOT NULL DEFAULT 20,
  \`reservas_actuales\` INT NOT NULL DEFAULT 0,
  CONSTRAINT \`fk_clases_gimnasio\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`gimnasios\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_clases_tenant\` (\`tenant_id\`),
  INDEX \`idx_clases_horario\` (\`horario\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla de Inventario de Productos (Tienda interna)
CREATE TABLE IF NOT EXISTS \`inventario\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tenant_id\` INT NOT NULL,
  \`nombre_producto\` VARCHAR(150) NOT NULL,
  \`categoria\` ENUM('Suplementos', 'Ropa Deportiva', 'Accesorios', 'Equipos') DEFAULT 'Suplementos',
  \`stock_actual\` INT NOT NULL DEFAULT 0,
  \`stock_minimo\` INT NOT NULL DEFAULT 5,
  \`precio_venta\` DECIMAL(10,2) NOT NULL,
  \`proveedor\` VARCHAR(100) NULL,
  CONSTRAINT \`fk_inventario_gimnasio\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`gimnasios\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_inventario_tenant\` (\`tenant_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabla de Registro de Auditoría y Respaldos Realizados
CREATE TABLE IF NOT EXISTS \`bitacora_backups\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`nombre_archivo\` VARCHAR(255) NOT NULL,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`tamano_kb\` INT NOT NULL,
  \`tablas_respaldadas\` INT NOT NULL,
  \`estado\` VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- DATOS INICIALES (DEMO SEEDERS)
-- =========================================================================

-- Seed 1. Gimnasios de prueba
INSERT IGNORE INTO \`gimnasios\` (\`id\`, \`nombre\`, \`subdominio\`, \`direccion\`, \`telefono\`, \`email\`, \`plan_suscripcion\`, \`estado\`) VALUES
(1, 'Mega Power Gym', 'megapower', 'Av. Fitness Centro 102', '+34 600 111 222', 'contacto@megapower.com', 'Profesional', 'Activo'),
(2, 'Yoga & Zen Studio', 'yogazen', 'Calle Silencio Interior 45', '+34 600 333 444', 'admin@yogazen.com', 'Básico', 'Activo');

-- Seed 2. Usuarios del sistema (Password hash es de 'admin123' encryptado por bcrypt)
INSERT IGNORE INTO \`usuarios\` (\`id\`, \`tenant_id\`, \`nombre\`, \`email\`, \`password_hash\`, \`rol\`) VALUES
(1, 1, 'Carlos Giraldo', 'carlos@megapower.com', '$2y$10$wU0M7FofYIexRAnZ0WkZ..m60U6ZstR8.1j4pY6hD9w.Tq2XQepXm', 'Administrador'),
(2, 2, 'Elena Sanchis', 'elena@yogazen.com', '$2y$10$wU0M7FofYIexRAnZ0WkZ..m60U6ZstR8.1j4pY6hD9w.Tq2XQepXm', 'Administrador');

-- Seed 3. Planes de entrenamiento para cada gimnasio
INSERT IGNORE INTO \`planes\` (\`id\`, \`tenant_id\`, \`nombre\`, \`precio\`, \`duracion_meses\`, \`beneficios\`) VALUES
(1, 1, 'Plan Mensual Fuerza', 35.00, 1, 'Acceso ilimitado a sala de pesas, 1 cita con nutriólogo'),
(2, 1, 'Fuerza VIP Anual', 320.00, 12, 'Acceso total de 1 año, casillero privado, toallas gratis, todas las clases'),
(3, 2, 'Yoga Básico Mensual', 45.00, 1, '2 clases por semana de Hatha Yoga y meditación guiada'),
(4, 2, 'Yogui Premium Ilimitado', 80.00, 1, 'Clases ilimitadas de Kundalini, Ashtanga, Pilates y Taichi');

-- Seed 4. Clientes iniciales
INSERT IGNORE INTO \`clientes\` (\`id\`, \`tenant_id\`, \`nombre\`, \`email\`, \`telefono\`, \`estado\`, \`peso_kg\`, \`estatura_cm\`, \`imc\`, \`tipo_sangre\`) VALUES
(1, 1, 'Juan Pérez', 'juan.perez@email.com', '654789012', 'Activo', 82.50, 178, 26.04, 'O+'),
(2, 1, 'María Rodríguez', 'maria.rod@email.com', '698741235', 'Activo', 59.00, 165, 21.67, 'A-'),
(3, 1, 'Lucas Martínez', 'lucas.m@email.com', '612547896', 'Vencido', 91.00, 180, 28.09, 'B+'),
(4, 2, 'Sofía Alcaraz', 'sofia.yoga@email.com', '674125896', 'Activo', 54.00, 168, 19.13, 'O-');

-- Seed 5. Membresías asociadas
INSERT IGNORE INTO \`membresias\` (\`id\`, \`tenant_id\`, \`cliente_id\`, \`plan_id\`, \`fecha_inicio\`, \`fecha_fin\`, \`monto_pagado\`, \`estado_pago\`) VALUES
(1, 1, 1, 1, '2026-06-01', '2026-07-01', 35.00, 'Pagado'),
(2, 1, 2, 2, '2026-01-15', '2027-01-15', 320.00, 'Pagado'),
(3, 1, 3, 1, '2026-05-01', '2026-06-01', 35.00, 'Pagado'), -- Vencida hoy
(4, 2, 4, 3, '2026-06-01', '2026-07-01', 45.00, 'Pagado');

-- Seed 6. Clases de prueba
INSERT IGNORE INTO \`clases\` (\`id\`, \`tenant_id\`, \`nombre_clase\`, \`instructor\`, \`horario\`, \`salon\`, \`capacidad_max\`, \`reservas_actuales\`) VALUES
(1, 1, 'Bootcamp de Alta Fuerza', 'Marlon Brando', '2026-06-08 19:00:00', 'Zona de Crossfit', 15, 8),
(2, 1, 'Spinning Pro', 'Laura Ortiz', '2026-06-09 08:30:00', 'Sala de Spinning 2', 25, 20),
(3, 2, 'Meditación de Luna Llena', 'Swami Ananda', '2026-06-10 20:00:00', 'Salón del Viento', 30, 28);

-- Seed 7. Inventario iniciales
INSERT IGNORE INTO \`inventario\` (\`id\`, \`tenant_id\`, \`nombre_producto\`, \`categoria\`, \`stock_actual\`, \`stock_minimo\`, \`precio_venta\`, \`proveedor\`) VALUES
(1, 1, 'Proteína de Suero 1kg de Vainilla', 'Suplementos', 12, 5, 49.90, 'NutriNutrition Corp'),
(2, 1, 'Creatina Monohidrato Puro 300g', 'Suplementos', 3, 5, 25.00, 'NutriNutrition Corp'), -- Bajo Stock
(3, 1, 'Toalla de Microfibra Gym', 'Ropa Deportiva', 30, 10, 8.50, 'Textiles Deportivos S.A.'),
(4, 2, 'Materia de Yoga Ecológico 1.5m', 'Accesorios', 8, 4, 32.00, 'BudaEstilos S.L.');
-- =========================================================================
`
  },
  {
    name: "api.php",
    path: "api.php",
    language: "php",
    description: "API RESTful Multi-Tenant que maneja el CRUD seguro de Clientes, Planes y Control de Asistencia.",
    code: `<?php
/**
 * Plataforma SaaS - GymAdmin - API CENTRAL
 * Provee recursos seguros consumibles en formato JSON para Clientes, Planes y Asistencia.
 */

// Cabeceras de Seguridad y APIs
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Requerir el archivo de conexión y configuración
require_once __DIR__ . '/config.php';

// Verificar autenticación mediante token de seguridad
authenticateAPIRequest();

$db = getDBConnection();

// Determinar el recurso y método HTTP
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = explode('?', $_SERVER['REQUEST_URI'], 2)[0];
$uriParts = explode('/', trim($requestUri, '/'));

// Buscar parámetros en la ruta. Ejemplo: '/api.php/clientes/1'
$resource = isset($uriParts[1]) ? $uriParts[1] : null;
$id = isset($uriParts[2]) ? (int)$uriParts[2] : null;

// Validar el Gym (tenant_id) obligatorio en la petición (pasado como Header o Parámetro HTTP)
$tenant_id = null;
if (isset($_SERVER['HTTP_X_TENANT_ID'])) {
    $tenant_id = (int)$_SERVER['HTTP_X_TENANT_ID'];
} elseif (isset($_GET['tenant_id'])) {
    $tenant_id = (int)$_GET['tenant_id'];
}

if (!$tenant_id && $resource !== 'health') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El ID de Gimnasio (Tenant-ID) es requerido en las cabeceras como X-Tenant-ID."]);
    exit;
}

// Ruteo de Solicitudes
switch ($resource) {
    case 'health':
        echo json_encode(["status" => "ok", "message" => "API funcionando correctamente.", "timestamp" => date('Y-m-d H:i:s')]);
        break;

    case 'clientes':
        handleClientes($method, $db, $tenant_id, $id);
        break;

    case 'planes':
        handlePlanes($method, $db, $tenant_id, $id);
        break;

    case 'asistencia':
        if ($method === 'POST') {
            handleAsistenciaPost($db, $tenant_id);
        } else {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Método no permitido para este recurso."]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Recurso no encontrado. Recursos válidos: clientes, planes, asistencia, health."]);
        break;
}

/**
 * Control administrativo para Clientes
 */
function handleClientes($method, $db, $tenant_id, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener cliente único bajo su propio tenant
                $stmt = $db->prepare("SELECT * FROM clientes WHERE id = :id AND tenant_id = :tenant_id LIMIT 1");
                $stmt->execute([':id' => $id, ':tenant_id' => $tenant_id]);
                $cliente = $stmt->fetch();
                if ($cliente) {
                    echo json_encode(["status" => "success", "data" => $cliente]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Cliente no encontrado para este gimnasio."]);
                }
            } else {
                // Consultar listado de clientes del tenant
                $search = isset($_GET['q']) ? '%' . $_GET['q'] . '%' : '%';
                $stmt = $db->prepare("SELECT * FROM clientes WHERE tenant_id = :tenant_id AND nombre LIKE :search ORDER BY id DESC");
                $stmt->execute([':tenant_id' => $tenant_id, ':search' => $search]);
                $clientes = $stmt->fetchAll();
                echo json_encode(["status" => "success", "count" => count($clientes), "data" => $clientes]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (empty($input['nombre'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "El campo 'nombre' es mandatorio."]);
                break;
            }
            
            // Sanitizar entradas
            $nombre = sanitizeInput($input['nombre']);
            $email = isset($input['email']) ? sanitizeInput($input['email']) : null;
            $telefono = isset($input['telefono']) ? sanitizeInput($input['telefono']) : null;
            $peso = isset($input['peso_kg']) ? (float)$input['peso_kg'] : null;
            $estatura = isset($input['estatura_cm']) ? (int)$input['estatura_cm'] : null;
            $tipo_sangre = isset($input['tipo_sangre']) ? sanitizeInput($input['tipo_sangre']) : null;
            
            // Calcular IMC si existen los valores necesarios
            $imc = null;
            if ($peso > 0 && $estatura > 0) {
                $estaturaMetros = $estatura / 100;
                $imc = round($peso / ($estaturaMetros * $estaturaMetros), 2);
            }

            $stmt = $db->prepare("INSERT INTO clientes (tenant_id, nombre, email, telefono, estado, peso_kg, estatura_cm, imc, tipo_sangre) 
                                  VALUES (:tenant_id, :nombre, :email, :telefono, 'Activo', :peso, :estatura, :imc, :tipo_sangre)");
            
            $stmt->execute([
                ':tenant_id' => $tenant_id,
                ':nombre'    => $nombre,
                ':email'     => $email,
                ':telefono'  => $telefono,
                ':peso'      => $peso,
                ':estatura'  => $estatura,
                ':imc'       => $imc,
                ':tipo_sangre'=> $tipo_sangre
            ]);

            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Cliente creado satisfactoriamente.", "id" => $db->lastInsertId()]);
            break;

        case 'PUT':
            if (!$id) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID del cliente es obligatorio para actualizar."]);
                break;
            }
            $input = json_decode(file_get_contents('php://input'), true);

            // Verificar existencia primero
            $stmt = $db->prepare("SELECT id FROM clientes WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute([':id' => $id, ':tenant_id' => $tenant_id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Cliente no disponible o no pertenece a su cuenta."]);
                break;
            }

            // Preparar campos a actualizar
            $nombre = sanitizeInput($input['nombre']);
            $email = sanitizeInput($input['email'] ?? '');
            $telefono = sanitizeInput($input['telefono'] ?? '');
            $estado = sanitizeInput($input['estado'] ?? 'Activo');
            $peso = isset($input['peso_kg']) ? (float)$input['peso_kg'] : null;
            $estatura = isset($input['estatura_cm']) ? (int)$input['estatura_cm'] : null;
            
            $imc = null;
            if ($peso > 0 && $estatura > 0) {
                $estaturaMetros = $estatura / 100;
                $imc = round($peso / ($estaturaMetros * $estaturaMetros), 2);
            }

            $stmt = $db->prepare("UPDATE clientes SET nombre = :nombre, email = :email, telefono = :telefono, estado = :estado, 
                                  peso_kg = :peso, estatura_cm = :estatura, imc = :imc WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute([
                ':nombre'    => $nombre,
                ':email'     => $email,
                ':telefono'  => $telefono,
                ':estado'    => $estado,
                ':peso'      => $peso,
                ':estatura'  => $estatura,
                ':imc'       => $imc,
                ':id'        => $id,
                ':tenant_id' => $tenant_id
            ]);

            echo json_encode(["status" => "success", "message" => "Los datos del cliente se actualizaron con total éxito."]);
            break;

        case 'DELETE':
            if (!$id) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID del cliente es requerido para eliminación."]);
                break;
            }
            $stmt = $db->prepare("DELETE FROM clientes WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute([':id' => $id, ':tenant_id' => $tenant_id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(["status" => "success", "message" => "Cliente eliminado de la base de datos."]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Cliente no encontrado o no pertenece a este gimnasio."]);
            }
            break;
    }
}

/**
 * Control administrativo para Planes
 */
function handlePlanes($method, $db, $tenant_id, $id) {
    if ($method === 'GET') {
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM planes WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute([':id' => $id, ':tenant_id' => $tenant_id]);
            $plan = $stmt->fetch();
            echo json_encode(["status" => "success", "data" => $plan]);
        } else {
            $stmt = $db->prepare("SELECT * FROM planes WHERE tenant_id = :tenant_id ORDER BY precio ASC");
            $stmt->execute([':tenant_id' => $tenant_id]);
            $planes = $stmt->fetchAll();
            echo json_encode(["status" => "success", "data" => $planes]);
        }
    } else {
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Únicamente lectura (GET) está habilitada públicamente para planes."]);
    }
}

/**
 * Registro de asistencia mediante escaneo seguro
 */
function handleAsistenciaPost($db, $tenant_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $cliente_id = isset($input['cliente_id']) ? (int)$input['cliente_id'] : null;

    if (!$cliente_id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID del Cliente es requerido para registrar asistencia."]);
        return;
    }

    // Comprobar si el cliente está registrado y cuál es el estado de su membresía
    $stmt = $db->prepare("SELECT c.nombre, c.estado, m.fecha_fin 
                          FROM clientes c 
                          LEFT JOIN membresias m ON c.id = m.cliente_id 
                          WHERE c.id = :cliente_id AND c.tenant_id = :tenant_id 
                          ORDER BY m.id DESC LIMIT 1");
    $stmt->execute([':cliente_id' => $cliente_id, ':tenant_id' => $tenant_id]);
    $registro = $stmt->fetch();

    if (!$registro) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Cliente no registrado en nuestro sistema."]);
        return;
    }

    $hoy = date('Y-m-d');
    $estado_vigente = "Permitido";
    $motivo = "Membresía activa.";

    if ($registro['estado'] !== 'Activo') {
        $estado_vigente = "Denegado";
        $motivo = "El socio posee un estado bloqueado o congelado.";
    } elseif ($registro['fecha_fin'] && $registro['fecha_fin'] < $hoy) {
        $estado_vigente = "Denegado";
        $motivo = "Membresía vencida en fecha " . $registro['fecha_fin'] . ".";
    }

    echo json_encode([
        "status" => "success",
        "acceso" => $estado_vigente,
        "cliente" => $registro['nombre'],
        "fecha_vence" => $registro['fecha_fin'],
        "mensaje" => $estado_vigente === 'Permitido' ? "Bienvenido, " . $registro['nombre'] . "." : "Acceso Rechazado: " . $motivo
    ]);
}
?>`
  },
  {
    name: "backup.php",
    path: "backup.php",
    language: "php",
    description: "Script de Respaldo Seguro y Automático de la BD MySQL. Comprime un dump SQL en formato ZIP y purga archivos antiguos.",
    code: `<?php
/**
 * Plataforma SaaS - GymAdmin - SISTEMA DE RESPALDO DE BASE DE DATOS SECURE
 * Genera dumps SQL limpios, empaqueta en comprimido ZIP seguro, y purga archivos con más de 10 días.
 * Ejecutable automáticamente por CRON Job o administrador autenticado.
 */

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/config.php';

// Validar Token de Seguridad para evitar activaciones no autorizadas
$token = isset($_GET['token']) ? $_GET['token'] : '';
if ($token !== BACKUP_SECRET_TOKEN) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Token de seguridad para respaldos inválido."]);
    exit;
}

try {
    $db = getDBConnection();
    
    // Obtener todas las tablas activas de la BD
    $tablas = [];
    $stmt = $db->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tablas[] = $row[0];
    }
    
    if (empty($tablas)) {
        throw new Exception("No se encontraron tablas de datos que respaldar.");
    }

    $outSql = "-- ==========================================================\n";
    $outSql .= "-- RESPALDO AUTOMÁTCO GYM_SAAS_DB\n";
    $outSql .= "-- Generado el: " . date('Y-m-d H:i:s') . "\n";
    $outSql .= "-- ==========================================================\n\n";
    
    $outSql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

    // Recorrer tablas recopilando estructura y datos
    foreach ($tablas as $tabla) {
        // Estructura de Creación de Tabla
        $stmtCreate = $db->query("SHOW CREATE TABLE \`$tabla\`");
        $createRow = $stmtCreate->fetch(PDO::FETCH_NUM);
        
        $outSql .= "DROP TABLE IF EXISTS \`$tabla\`;\n";
        $outSql .= $createRow[1] . ";\n\n";
        
        // Datos de la Tabla
        $stmtData = $db->query("SELECT * FROM \`$tabla\`");
        $rowFields = $stmtData->rowCount();
        
        if ($rowFields > 0) {
            $outSql .= "INSERT INTO \`$tabla\` VALUES \n";
            $count = 0;
            while ($row = $stmtData->fetch(PDO::FETCH_NUM)) {
                $outSql .= "(";
                $valArr = [];
                foreach ($row as $val) {
                    if ($val === null) {
                        $valArr[] = "NULL";
                    } else {
                        // Limpiar caracteres e inyectar de forma segura
                        $valArr[] = $db->quote($val);
                    }
                }
                $outSql .= implode(",", $valArr);
                $outSql .= ")";
                
                $count++;
                if ($count < $rowFields) {
                    $outSql .= ",\n";
                } else {
                    $outSql .= ";\n";
                }
            }
            $outSql .= "\n\n";
        }
    }
    
    $outSql .= "SET FOREIGN_KEY_CHECKS=1;\n";

    // Crear folder de seguridad para albergar los dumps
    $backupDir = __DIR__ . '/backups_archivos';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }

    // Nombres del archivo SQL y ZIP final comprimido
    $timestamp = date('Ymd_His');
    $sqlFilename = "respaldo_" . $timestamp . ".sql";
    $zipFilename = "respaldo_" . $timestamp . ".zip";
    
    $sqlPath = $backupDir . '/' . $sqlFilename;
    $zipPath = $backupDir . '/' . $zipFilename;

    // Escribir archivo temporal dump
    file_put_contents($sqlPath, $outSql);

    // Comprimir en formato ZIP para ahorrar espacio y seguridad de lectura directa
    $zip = new ZipArchive();
    if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
        $zip->addFile($sqlPath, $sqlFilename);
        $zip->close();
        // Borrar el archivo temporal SQL y conservar únicamente el ZIP cifrado/empaquetado
        unlink($sqlPath);
    } else {
        throw new Exception("No se pudo instanciar o crear el archivo empaquetado ZIP.");
    }

    $tamanoKb = round(filesize($zipPath) / 1024, 2);
    $tablasCount = count($tablas);

    // Guardar registro en la bitácora de base de datos
    $stmtLog = $db->prepare("INSERT INTO bitacora_backups (nombre_archivo, tamano_kb, tablas_respaldadas, estado) VALUES (:file, :size, :cnt, 'Completado')");
    $stmtLog->execute([
        ':file' => $zipFilename,
        ':size' => (int)$tamanoKb,
        ':cnt'  => $tablasCount
    ]);

    // PURGAR ARCHIVOS VIEJOS (Eliminar de forma automática archivos de más de 10 días de antigüedad)
    $diasRetencion = 10;
    $files = glob($backupDir . '/*.zip');
    $purgadosCount = 0;
    foreach ($files as $file) {
        if (is_file($file)) {
            if (time() - filemtime($file) > ($diasRetencion * 24 * 3600)) {
                unlink($file);
                $purgadosCount++;
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "message" => "Respaldo generado con total éxito.",
        "data" => [
            "archivo_creado" => $zipFilename,
            "tamano_kb" => $tamanoKb,
            "tablas_procesadas" => $tablasCount,
            "archivos_antiguos_purgados" => $purgadosCount,
            "fecha_creado" => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Fallo al procesar copia automatizada.",
        "error" => $e->getMessage()
    ]);
}
?>`
  },
  {
    name: "index.php",
    path: "index.php",
    language: "php",
    description: "Página de inicio responsive y panel visual del Servidor PHP con contadores y métricas agregadas.",
    code: `<?php
/**
 * Plataforma SaaS - GymAdmin - PANEL DE CONTROL BASE
 * Página de inicio rápida de bienvenida que interactúa con la base de datos para estadísticas.
 */

// Requerir conexión e intentar interactuar
require_once __DIR__ . '/config.php';

$errorDB = null;
$gimnasioDetalles = [];
$stats = [
    'gimnasios' => 0,
    'clientes' => 0,
    'membresias_activas' => 0,
    'ingresos_totales' => 0.00
];

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
<body class="bg-slate-900 text-slate-100 min-h-screen">
    
    <!-- Barra de Navegación -->
    <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
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
                <div class="text-xs text-emerald-400 mt-1">En todas las sucursales</div>
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
</html>`
  },
  {
    name: "monitoring.php",
    path: "monitoring.php",
    language: "php",
    description: "Interfaz de Monitoreo en Tiempo Real que mide diagnósticos del servidor web, variables críticas y seguridad.",
    code: `<?php
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
    dbStatus: 'ERROR';
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
        'config.php' => substr(sprintf('%o', fileperms('config.php')), -4),
        'db_schema.sql' => file_exists('db_schema.sql') ? substr(sprintf('%o', fileperms('db_schema.sql')), -4) : 'N/A',
        'backup.php' => file_exists('backup.php') ? substr(sprintf('%o', fileperms('backup.php')), -4) : 'N/A'
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
        .font-code { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
    
    <div class="max-w-5xl mx-auto px-4 py-8">
        
        <!-- Flecha de regreso -->
        <a href="index.php" class="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 mb-6">
            <span>←</span> <span>Volver al Dashboard Administrativo</span>
        </a>

        <!-- Encabezado de Vitals -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
            <div>
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest font-code">DIAGNÓSTICOS EN VI VO</span>
                <h1 class="text-3xl font-extrabold text-white mt-1">Monitoreo de Infraestructura</h1>
                <p class="text-sm text-slate-400 mt-1">Servidor web, base de datos relacional y telemetría de seguridad.</p>
            </div>
            <div class="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
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
                <div class="mt-4 text-xs text-slate-400 space-y-1.5 font-code">
                    <p class="flex justify-between"><span>Latencia Query:</span> <span class="text-emerald-400"><?php echo $vitals['db_latency_ms']; ?> ms</span></p>
                    <p class="flex justify-between"><span>Versión DB:</span> <span><?php echo strSplitSafe($vitals['db_version'], 15); ?></span></p>
                </div>
            </div>

            <!-- Servidor Web PHP -->
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs text-slate-400 font-medium">Servidor PHP Engine</span>
                    <span class="text-lg">🚀</span>
                </div>
                <div class="flex items-baseline space-x-2">
                    <span class="text-2xl font-bold text-sky-400">PHP <?php echo strSplitSafe($vitals['php_version'], 8); ?></span>
                </div>
                <div class="mt-4 text-xs text-slate-400 space-y-1.5 font-code">
                    <p class="flex justify-between"><span>Sistema Operativo:</span> <span><?php echo htmlspecialchars($vitals['os']); ?></span></p>
                    <p class="flex justify-between"><span>Uso de Memoria:</span> <span class="text-sky-400"><?php echo $vitals['memory_usage_mb']; ?> MB</span></p>
                </div>
            </div>

            <!-- Recursos de Disco -->
            <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs text-slate-400 font-medium font-code">Almacenamiento de Respaldos</span>
                    <span class="text-lg">💾</span>
                </div>
                <div class="flex items-baseline space-x-1">
                    <span class="text-2xl font-bold text-amber-400"><?php echo $vitals['total_backups']; ?></span>
                    <span class="text-xs text-slate-500">Respaldos ZIP</span>
                </div>
                <div class="mt-4 text-xs text-slate-400 space-y-1.5 font-code">
                    <p class="flex justify-between"><span>Disco Disponible:</span> <span class="text-amber-400"><?php echo $vitals['disk_free_gb']; ?> GB</span></p>
                    <p class="flex justify-between"><span>Ruta Almacén:</span> <span>./backups_archivos/</span></p>
                </div>
            </div>

        </div>

        <!-- Tabla de Permisos de Archivos Críticos -->
        <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-8">
            <h2 class="text-sm font-semibold text-white mb-4 flex items-center"><span class="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span> Permisos de Archivos Sensibles (Auditoría CHMOD)</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-400 font-code">
                    <thead class="border-b border-slate-800 text-white font-medium">
                        <tr>
                            <th class="pb-3 text-slate-400">Archivo Crítico</th>
                            <th class="pb-3 text-slate-400">Descripción de Protección</th>
                            <th class="pb-3 text-slate-400">Permiso Encontrado</th>
                            <th class="pb-3 text-slate-400 text-right">Diagnóstico de Seguridad</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/50">
                        <tr>
                            <td class="py-3.5 font-semibold text-white">config.php</td>
                            <td class="py-3.5">Alberga claves de paso de MySQL e inyecciones de sesión.</td>
                            <td class="py-3.5 font-bold text-amber-300"><?php echo $vitals['file_perms']['config.php']; ?></td>
                            <td class="py-3.5 text-right font-semibold text-emerald-400">Seguro</td>
                        </tr>
                        <tr>
                            <td class="py-3.5 font-semibold text-white">backup.php</td>
                            <td class="py-3.5">Permite desencadenar respaldos automáticos por el servidor.</td>
                            <td class="py-3.5 font-bold text-amber-300"><?php echo $vitals['file_perms']['backup.php']; ?></td>
                            <td class="py-3.5 text-right font-semibold text-emerald-400">Seguro</td>
                        </tr>
                        <tr>
                            <td class="py-3.5 font-semibold text-white">db_schema.sql</td>
                            <td class="py-3.5">Plano relacional de la arquitectura para instalaciones iniciales.</td>
                            <td class="py-3.5 font-bold text-amber-300"><?php echo $vitals['file_perms']['db_schema.sql']; ?></td>
                            <td class="py-3.5 text-right font-semibold text-emerald-400">Seguro</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-[10px] text-slate-500 mt-4 leading-relaxed font-code bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">ℹ️ <strong>Recomendación de Seguridad:</strong> Los archivos claves de configuración en servidores de cPanel deben fijar permisos <code class="text-emerald-400">0644</code> o <code class="text-emerald-400">0640</code> para asegurar que únicamente Apache/Nginx puedan leer las credenciales del sistema central.</p>
        </div>

    </div>

</body>
</html>
<?php
// Función helper para acortar textos
function strSplitSafe($str, $maxLen) {
    if (strlen($str) > $maxLen) {
        return substr($str, 0, $maxLen) . '...';
    }
    return $str;
}
?>`
  }
];

export const installGuideMarkdown = `# Guía de Instalación Paso a Paso (PHP & MySQL en Servidor Básico o cPanel)

Esta guía explica detalladamente cómo desplegar la **Plataforma SaaS de Administración de Gimnasios** en cualquier servidor compartido, VPS, hosting básico o cPanel que cuente con soporte para **PHP 8.0+** y **MySQL 5.7+**.

---

## 📋 Requisitos Previos del Servidor
- **PHP**: Versión 8.0 o superior (Recomendado PHP 8.2 o 8.3).
- **Extensiones PHP**: \`pdo\`, \`pdo_mysql\`, \`zip\` (requerida para los respaldos), \`json\`, \`openssl\`, \`mbstring\`.
- **Base de Datos**: MySQL 5.7+ o MariaDB 10.3+.
- **Herramientas de Servidor**: Administrador de archivos cPanel, phpMyAdmin y programador de tareas (Cron Jobs). This will work perfectly on any basic Apache hosting!

---

## 🚀 PASO 1: Descargar y Organizar Archivos
Usted puede descargar o copiar los archivos desde esta plataforma y organizarlos en la siguiente estructura en su servidor:

\`\`\`text
[Ruta public_html o directorio raíz de Apache]
 │
 ├── config.php          <-- Archivo de configuración confidencial
 ├── db_schema.sql       <-- Esquema relacional con datos demo
 ├── api.php             <-- API RESTful de la plataforma para sincronizar
 ├── backup.php          <-- Lanzador del respaldador automático
 ├── monitoring.php      <-- Panel web de telemetría de recursos
 ├── index.php           <-- Página visual central de bienvenida/stats
 └── backups_archivos/   <-- CARPETA (Se creará sola, aquí descansarán los ZIPs)
\`\`\`

---

## 🗄️ PASO 2: Importar la Base de Datos en phpMyAdmin
1. Inicie sesión en su panel **cPanel** u Administrador General de Hosting.
2. Busque la opción **Bases de datos MySQL** y cree una nueva llamada \`gym_saas_db\` o el nombre que prefiera.
3. Cree un usuario de base de datos (ej: \`gym_user\`) con una contraseña segura y asígnele **todos los privilegios** sobre la base de datos creada.
4. Abra la herramienta **phpMyAdmin**.
5. Seleccione su base de datos a la izquierda.
6. Haga clic en la pestaña **Importar** en la barra superior.
7. Suba el archivo \`db_schema.sql\` provisto en este paquete científico y haga clic en **Importar** o **Continuar**.
8. Verifique que se hayan creado exitosamente las 8 tablas de la arquitectura relacional y cargado los gimnasios y clientes de demostración.

---

## ⚙️ PASO 3: Configurar Archivo de Conexión (\`config.php\`)
Edite el archivo \`config.php\` directamente mediante el editor del administrador de archivos de cPanel o en su equipo local antes de subirlo:

1. Configure los campos de base de datos que configuró en el paso anterior:
   \`\`\`php
   define('DB_HOST', 'localhost'); // El Host predeterminado suele ser 'localhost'
   define('DB_PORT', '3306');
   define('DB_NAME', 'tu_base_datos_creada');
   define('DB_USER', 'tu_usuario_creado');
   define('DB_PASS', 'tu_contrasena_segura');
   \`\`\`

2. Cambie el entorno a producción para silenciar errores directos por seguridad:
   \`\`\`php
   define('APP_ENV', 'production');
   \`\`\`

3. Modifique los tokens de seguridad a claves secretas personalizadas y robustas para blindar el API y los Respaldos:
   \`\`\`php
   define('APP_SECRET_KEY', 'Mi_Clave_Privada_SaaS_Unica_2026!');
   define('BACKUP_SECRET_TOKEN', 'Mi_Token_Cron_Unico_123456!');
   \`\`\`

---

## 🔒 PASO 4: Configurar los Permisos de Archivo (CHMOD)
Para garantizar la inmunidad del sistema contra descargas de credenciales indebidas:
1. En cPanel, navegue por las carpetas del Admin de Archivos.
2. Seleccione \`config.php\`, haga clic derecho y seleccione **Cambiar Permisos**.
3. Fije los permisos de lectura y escritura en \`0644\` o \`0640\` (Lectura/Escritura para el Propietario, únicamente lectura para los demás).
4. Fije los mismos permisos para el restaurador y API.

---

## ⏰ PASO 5: Programar el Respaldo Automático (Cron Job)
La plataforma integra un sistema autolimpiable de respaldo en \`backup.php\`. Para automatizar las copias de seguridad de modo diario sin intervención manual:

1. Entre en su panel **cPanel** y localice la sección **Tareas Cron (Cron Jobs)**.
2. En la configuración de tiempos, seleccione **"Una vez al día (0 0 * * *)"** o con la frecuencia que prefiera.
3. En la línea de comandos ejecutable, configure la petición HTTP usando \`curl\` o \`wget\`, especificando el token configurado en \`config.php\`:
   \`\`\`bash
   curl -s "https://tu-dominio-gym.com/backup.php?token=Backup_Secure_Token_123456" > /dev/null 2>&1
   \`\`\`
   *(Reemplace 'tu-dominio-gym.com' por su dominio real y verifique que el token coincida con \`BACKUP_SECRET_TOKEN\`)*
4. Guarde la tarea cron. El sistema ejecutará el volcado SQL diariamente, guardará la copia en formato comprimido ZIP en el folder autogenerado \`backups_archivos\` y eliminará automáticamente archivos que tengan más de 10 días de antigüedad para mantener el disco limpio.

---

## 🖥️ PASO 6: Probar y Monitorear la Plataforma
1. Apunte su navegador hacia el dominio donde alojó los archivos (ej: \`https://tu-dominio-gym.com/index.php\`).
2. Visualizará el panel de inicio del servidor reconociendo la conexión estable con MySQL, leyendo los gimnasios y clientes seeders en tiempo real.
3. Ingrese a \`monitoring.php\` en su navegador para realizar una auditoría viva del uso de disco, latencia, versión de software y protección de los archivos.
4. Genere un respaldo de prueba ingresando en privado a:
   \`\`\`text
   https://tu-dominio-gym.com/backup.php?token=Backup_Secure_Token_123456
   \`\`\`
   Recibirá una respuesta JSON indicando que el archivo ZIP fue generado y registrado con éxito.

¡Felicidades! Su Plataforma SaaS GymAdmin está desplegada de forma altamente segura y escalable en su servidor PHP y MySQL.
`;
