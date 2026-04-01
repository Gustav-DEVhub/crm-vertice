-- ============================================================
-- Script SQL: Creación de usuario PostgreSQL con mínimo privilegio
-- CRM Inmobiliaria Vértice
-- ============================================================

-- 1. Crear usuario con contraseña segura
CREATE USER crm_app WITH PASSWORD 'password_seguro_cambiar_en_produccion';

-- 2. Conectar a la base de datos del CRM
-- \c crm_db

-- 3. Otorgar permisos mínimos necesarios
GRANT USAGE ON SCHEMA public TO crm_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO crm_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO crm_app;

-- 4. Asegurar que los permisos se apliquen a tablas y secuencias futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO crm_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO crm_app;

-- ⚠️ NUNCA otorgar estos permisos al usuario crm_app:
-- GRANT DROP, ALTER, CREATE
-- Nunca conectar con el usuario postgres desde la aplicación
