-- =========================================================================
-- Plataforma SaaS - GymAdmin : Esquema Completo MySQL
-- Compatible con MySQL 5.7+ y MySQL 8.0
-- Diseñado con Multi-Tenancy mediante 'tenant_id' para alta eficiencia.
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `gym_saas_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gym_saas_db`;

-- 1. Tabla de Gimnasios (Tenants)
CREATE TABLE IF NOT EXISTS `gimnasios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `subdominio` VARCHAR(50) NOT NULL UNIQUE,
  `direccion` VARCHAR(255) NULL,
  `telefono` VARCHAR(30) NULL,
  `email` VARCHAR(100) NOT NULL,
  `plan_suscripcion` ENUM('Básico', 'Profesional', 'Enterprise') DEFAULT 'Básico',
  `estado` ENUM('Activo', 'Suspendido') DEFAULT 'Activo',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gimnasio_estado` (`estado`),
  INDEX `idx_gimnasio_subdominio` (`subdominio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Usuarios del Sistema (Roles Administrativos)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('Super Admin', 'Administrador', 'Recepcionista', 'Entrenador') DEFAULT 'Administrador',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_email_tenant` (`email`, `tenant_id`),
  CONSTRAINT `fk_usuarios_gimnasio` FOREIGN KEY (`tenant_id`) REFERENCES `gimnasios` (`id`) ON DELETE CASCADE,
  INDEX `idx_usuarios_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Planes de Membresías definidos por cada Gimnasio
CREATE TABLE IF NOT EXISTS `planes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `duracion_meses` INT NOT NULL DEFAULT 1,
  `beneficios` TEXT NULL, -- Formato JSON o de texto separado por comas
  CONSTRAINT `fk_planes_gimnasio` FOREIGN KEY (`tenant_id`) REFERENCES `gimnasios` (`id`) ON DELETE CASCADE,
  INDEX `idx_planes_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Clientes del Gimnasio
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` INT NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NULL,
  `telefono` VARCHAR(30) NULL,
  `foto_url` VARCHAR(255) DEFAULT NULL,
  `estado` ENUM('Activo', 'Vencido', 'Congelado') DEFAULT 'Activo',
  `peso_kg` DECIMAL(5,2) NULL,
  `estatura_cm` INT NULL,
  `imc` DECIMAL(4,2) NULL,
  `tipo_sangre` VARCHAR(5) NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_clientes_gimnasio` FOREIGN KEY (`tenant_id`) REFERENCES `gimnasios` (`id`) ON DELETE CASCADE,
  INDEX `idx_clientes_tenant` (`tenant_id`),
  INDEX `idx_clientes_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Historial de Suscripciones adquiridas por los clientes
CREATE TABLE IF NOT EXISTS `membresias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` INT NOT NULL,
  `cliente_id` INT NOT NULL,
  `plan_id` INT NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `monto_pagado` DECIMAL(10,2) NOT NULL,
  `estado_pago` ENUM('Pagado', 'Pendiente', 'Anulado') DEFAULT 'Pagado',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_membresias_gimnasio` FOREIGN KEY (`tenant_id`) REFERENCES `gimnasios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membresias_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membresias_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE RESTRICT,
  INDEX `idx_membresias_tenant` (`tenant_id`),
  INDEX `idx_membresias_cliente` (`cliente_id`),
  INDEX `idx_membresias_fechas` (`fecha_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Clases Grupales y Actividades programadas
CREATE TABLE IF NOT EXISTS `clases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` INT NOT NULL,
  `nombre_clase` VARCHAR(100) NOT NULL,
  `instructor` VARCHAR(100) NOT NULL,
  `horario` DATETIME NOT NULL,
  `salon` VARCHAR(100) NULL,
  `capacidad_max` INT NOT NULL DEFAULT 20,
  `reservas_actuales` INT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_clases_gimnasio` FOREIGN KEY (`tenant_id`) REFERENCES `gimnasios` (`id`) ON DELETE CASCADE,
  INDEX `idx_clases_tenant` (`tenant_id`),
  INDEX `idx_clases_horario` (`horario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla de Inventario de Productos (Tienda interna)
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` INT NOT NULL,
  `nombre_producto` VARCHAR(150) NOT NULL,
  `categoria` ENUM('Suplementos', 'Ropa Deportiva', 'Accesorios', 'Equipos') DEFAULT 'Suplementos',
  `stock_actual` INT NOT NULL DEFAULT 0,
  `stock_minimo` INT NOT NULL DEFAULT 5,
  `precio_venta` DECIMAL(10,2) NOT NULL,
  `proveedor` VARCHAR(100) NULL,
  CONSTRAINT `fk_inventario_gimnasio` FOREIGN KEY (`tenant_id`) REFERENCES `gimnasios` (`id`) ON DELETE CASCADE,
  INDEX `idx_inventario_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabla de Registro de Auditoría y Respaldos Realizados
CREATE TABLE IF NOT EXISTS `bitacora_backups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_archivo` VARCHAR(255) NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `tamano_kb` INT NOT NULL,
  `tablas_respaldadas` INT NOT NULL,
  `estado` VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- DATOS INICIALES (DEMO SEEDERS)
-- =========================================================================

-- Seed 1. Gimnasios de prueba
INSERT IGNORE INTO `gimnasios` (`id`, `nombre`, `subdominio`, `direccion`, `telefono`, `email`, `plan_suscripcion`, `estado`) VALUES
(1, 'Mega Power Gym', 'megapower', 'Av. Fitness Centro 102', '+34 600 111 222', 'contacto@megapower.com', 'Profesional', 'Activo'),
(2, 'Yoga & Zen Studio', 'yogazen', 'Calle Silencio Interior 45', '+34 600 333 444', 'admin@yogazen.com', 'Básico', 'Activo');

-- Seed 2. Usuarios del sistema (Password hash es de 'admin123' encryptado por bcrypt)
INSERT IGNORE INTO `usuarios` (`id`, `tenant_id`, `nombre`, `email`, `password_hash`, `rol`) VALUES
(1, 1, 'Carlos Giraldo', 'carlos@megapower.com', '$2y$10$wU0M7FofYIexRAnZ0WkZ..m60U6ZstR8.1j4pY6hD9w.Tq2XQepXm', 'Administrador'),
(2, 2, 'Elena Sanchis', 'elena@yogazen.com', '$2y$10$wU0M7FofYIexRAnZ0WkZ..m60U6ZstR8.1j4pY6hD9w.Tq2XQepXm', 'Administrador');

-- Seed 3. Planes de entrenamiento para cada gimnasio
INSERT IGNORE INTO `planes` (`id`, `tenant_id`, `nombre`, `precio`, `duracion_meses`, `beneficios`) VALUES
(1, 1, 'Plan Mensual Fuerza', 35.00, 1, 'Acceso ilimitado a sala de pesas, 1 cita con nutriólogo'),
(2, 1, 'Fuerza VIP Anual', 320.00, 12, 'Acceso total de 1 año, casillero privado, toallas gratis, todas las clases'),
(3, 2, 'Yoga Básico Mensual', 45.00, 1, '2 clases por semana de Hatha Yoga y meditación guiada'),
(4, 2, 'Yogui Premium Ilimitado', 80.00, 1, 'Clases ilimitadas de Kundalini, Ashtanga, Pilates y Taichi');

-- Seed 4. Clientes iniciales
INSERT IGNORE INTO `clientes` (`id`, `tenant_id`, `nombre`, `email`, `telefono`, `estado`, `peso_kg`, `estatura_cm`, `imc`, `tipo_sangre`) VALUES
(1, 1, 'Juan Pérez', 'juan.perez@email.com', '654789012', 'Activo', 82.50, 178, 26.04, 'O+'),
(2, 1, 'María Rodríguez', 'maria.rod@email.com', '698741235', 'Activo', 59.00, 165, 21.67, 'A-'),
(3, 1, 'Lucas Martínez', 'lucas.m@email.com', '612547896', 'Vencido', 91.00, 180, 28.09, 'B+'),
(4, 2, 'Sofía Alcaraz', 'sofia.yoga@email.com', '674125896', 'Activo', 54.00, 168, 19.13, 'O-');

-- Seed 5. Membresías asociadas
INSERT IGNORE INTO `membresias` (`id`, `tenant_id`, `cliente_id`, `plan_id`, `fecha_inicio`, `fecha_fin`, `monto_pagado`, `estado_pago`) VALUES
(1, 1, 1, 1, '2026-06-01', '2026-07-01', 35.00, 'Pagado'),
(2, 1, 2, 2, '2026-01-15', '2027-01-15', 320.00, 'Pagado'),
(3, 1, 3, 1, '2026-05-01', '2026-06-01', 35.00, 'Pagado'), -- Vencida hoy
(4, 2, 4, 3, '2026-06-01', '2026-07-01', 45.00, 'Pagado');

-- Seed 6. Clases de prueba
INSERT IGNORE INTO `clases` (`id`, `tenant_id`, `nombre_clase`, `instructor`, `horario`, `salon`, `capacidad_max`, `reservas_actuales`) VALUES
(1, 1, 'Bootcamp de Alta Fuerza', 'Marlon Brando', '2026-06-08 19:00:00', 'Zona de Crossfit', 15, 8),
(2, 1, 'Spinning Pro', 'Laura Ortiz', '2026-06-09 08:30:00', 'Sala de Spinning 2', 25, 20),
(3, 2, 'Meditación de Luna Llena', 'Swami Ananda', '2026-06-10 20:00:00', 'Salón del Viento', 30, 28);

-- Seed 7. Inventario iniciales
INSERT IGNORE INTO `inventario` (`id`, `tenant_id`, `nombre_producto`, `categoria`, `stock_actual`, `stock_minimo`, `precio_venta`, `proveedor`) VALUES
(1, 1, 'Proteína de Suero 1kg de Vainilla', 'Suplementos', 12, 5, 49.90, 'NutriNutrition Corp'),
(2, 1, 'Creatina Monohidrato Puro 300g', 'Suplementos', 3, 5, 25.00, 'NutriNutrition Corp'), -- Bajo Stock
(3, 1, 'Toalla de Microfibra Gym', 'Ropa Deportiva', 30, 10, 8.50, 'Textiles Deportivos S.A.'),
(4, 2, 'Materia de Yoga Ecológico 1.5m', 'Accesorios', 8, 4, 32.00, 'BudaEstilos S.L.');
-- =========================================================================
