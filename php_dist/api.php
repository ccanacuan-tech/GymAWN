<?php
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
?>
