<?php
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
    $outSql .= "-- RESPALDO AUTOMÁTICO GYM_SAAS_DB\n";
    $outSql .= "-- Generado el: " . date('Y-m-d H:i:s') . "\n";
    $outSql .= "-- ==========================================================\n\n";
    
    $outSql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

    // Recorrer tablas recopilando estructura y datos
    foreach ($tablas as $tabla) {
        // Estructura de Creación de Tabla
        $stmtCreate = $db->query("SHOW CREATE TABLE `$tabla`");
        $createRow = $stmtCreate->fetch(PDO::FETCH_NUM);
        
        $outSql .= "DROP TABLE IF EXISTS `$tabla`;\n";
        $outSql .= $createRow[1] . ";\n\n";
        
        // Datos de la Tabla
        $stmtData = $db->query("SELECT * FROM `$tabla`");
        $rowFields = $stmtData->rowCount();
        
        if ($rowFields > 0) {
            $outSql .= "INSERT INTO `$tabla` VALUES \n";
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
?>
