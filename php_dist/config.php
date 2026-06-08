<?php
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
?>
