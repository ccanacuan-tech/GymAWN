# Guía de Instalación Paso a Paso (PHP & MySQL en Servidor Básico o cPanel)

Esta guía explica detalladamente cómo desplegar la **Plataforma SaaS de Administración de Gimnasios** en cualquier servidor compartido, VPS, hosting básico o cPanel que cuente con soporte para **PHP 8.0+** y **MySQL 5.7+**.

---

## 📋 Requisitos Previos del Servidor
- **PHP**: Versión 8.0 o superior (Recomendado PHP 8.2 o 8.3).
- **Extensiones PHP**: `pdo`, `pdo_mysql`, `zip` (requerida para los respaldos), `json`, `openssl`, `mbstring`.
- **Base de Datos**: MySQL 5.7+ o MariaDB 10.3+.
- **Herramientas de Servidor**: Administrador de archivos cPanel, phpMyAdmin y programador de tareas (Cron Jobs). Funciona a la perfección en Apache clásico.

---

## 🚀 PASO 1: Descargar y Organizar Archivos
Usted puede descargar o copiar los archivos desde esta plataforma (disponibles en la carpeta `/php_dist/` de este proyecto) y organizarlos en la siguiente estructura en su servidor:

```text
[Ruta public_html o directorio raíz de Apache]
 │
 ├── config.php          <-- Archivo de configuración confidencial
 ├── db_schema.sql       <-- Esquema relacional con datos demo
 ├── api.php             <-- API RESTful de la plataforma para sincronizar
 ├── backup.php          <-- Lanzador del respaldador automático
 ├── monitoring.php      <-- Panel web de telemetría de recursos
 ├── index.php           <-- Página visual central de bienvenida/stats
 └── backups_archivos/   <-- CARPETA (Se creará sola, aquí descansarán los ZIPs)
```

---

## 🗄️ PASO 2: Importar la Base de Datos en phpMyAdmin
1. Inicie sesión en su panel **cPanel** u Administrador General de Hosting.
2. Busque la opción **Bases de datos MySQL** y cree una nueva llamada `gym_saas_db` o el nombre que prefiera.
3. Cree un usuario de base de datos (ej: `gym_user`) con una contraseña segura y asígnele **todos los privilegios** sobre la base de datos creada.
4. Abra la herramienta **phpMyAdmin**.
5. Seleccione su base de datos a la izquierda.
6. Haga clic en la pestaña **Importar** en la barra superior.
7. Suba el archivo `db_schema.sql` provisto en este paquete y haga clic en **Importar** o **Continuar**.
8. Verifique que se hayan creado exitosamente las 8 tablas de la arquitectura relacional y cargado los gimnasios y clientes de demostración.

---

## ⚙️ PASO 3: Configurar Archivo de Conexión (`config.php`)
Edite el archivo `config.php` directamente mediante el editor del administrador de archivos de cPanel o en su equipo local antes de subirlo:

1. Configure los campos de base de datos que configuró en el paso anterior:
   ```php
   define('DB_HOST', 'localhost'); // El Host predeterminado suele ser 'localhost'
   define('DB_PORT', '3306');
   define('DB_NAME', 'tu_base_datos_creada');
   define('DB_USER', 'tu_usuario_creado');
   define('DB_PASS', 'tu_contrasena_segura');
   ```

2. Cambie el entorno a producción para silenciar errores directos por seguridad:
   ```php
   define('APP_ENV', 'production');
   ```

3. Modifique los tokens de seguridad a claves secretas personalizadas y robustas para blindar el API y los Respaldos:
   ```php
   define('APP_SECRET_KEY', 'Mi_Clave_Privada_SaaS_Unica_2026!');
   define('BACKUP_SECRET_TOKEN', 'Mi_Token_Cron_Unico_123456!');
   ```

---

## 🔒 PASO 4: Configurar los Permisos de Archivo (CHMOD)
Para garantizar la inmunidad del sistema contra descargas de credenciales indebidas:
1. En cPanel, navegue por las carpetas del Admin de Archivos.
2. Seleccione `config.php`, haga clic derecho y seleccione **Cambiar Permisos**.
3. Fije los permisos de lectura y escritura en `0644` o `0640` (Lectura/Escritura para el Propietario, únicamente lectura para los demás).
4. Fije los mismos permisos para el restaurador y API.

---

## ⏰ PASO 5: Programar el Respaldo Automático (Cron Job)
La plataforma integra un sistema autolimpiable de respaldo en `backup.php`. Para automatizar las copias de seguridad de modo diario sin intervención manual:

1. Entre en su panel **cPanel** y localice la sección **Tareas Cron (Cron Jobs)**.
2. En la configuración de tiempos, seleccione **"Una vez al día (0 0 * * *)"** o con la frecuencia que prefiera.
3. En la línea de comandos ejecutable, configure la petición HTTP usando `curl` o `wget`, especificando el token configurado en `config.php`:
   ```bash
   curl -s "https://tu-dominio-gym.com/backup.php?token=Backup_Secure_Token_123456" > /dev/null 2>&1
   ```
   *(Reemplace 'tu-dominio-gym.com' por su dominio real y verifique que el token coincida con `BACKUP_SECRET_TOKEN`)*
4. Guarde la tarea cron. El sistema ejecutará el volcado SQL diariamente, guardará la copia en formato comprimido ZIP en el folder autogenerado `backups_archivos` y eliminará automáticamente archivos que tengan más de 10 días de antigüedad para mantener el disco limpio.

---

## 🖥️ PASO 6: Probar y Monitorear la Plataforma
1. Apunte su navegador hacia el dominio donde alojó los archivos (ej: `https://tu-dominio-gym.com/index.php`).
2. Visualizará el panel de inicio del servidor reconociendo la conexión estable con MySQL, leyendo los gimnasios y clientes seeders en tiempo real.
3. Ingrese a `monitoring.php` en su navegador para realizar una auditoría viva del uso de disco, latencia, versión de software y protección de los archivos.
4. Genere un respaldo de prueba ingresando en privado a:
   ```text
   https://tu-dominio-gym.com/backup.php?token=Backup_Secure_Token_123456
   ```
   Recibirá una respuesta JSON indicando que el archivo ZIP fue generado y registrado con éxito.

¡Felicidades! Su Plataforma SaaS GymAdmin está desplegada de forma altamente segura y escalable en su servidor PHP y MySQL.
