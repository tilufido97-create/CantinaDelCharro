import { ref, set, get } from "firebase/database";
import { database } from "../config/firebase";
import { seedUsersDB } from "./seedersDB";
import { ROLE_PERMISSIONS } from "../config/roles";
import { logger } from "../utils/logger";

export const migrationService = {
  async checkAndMigrate() {
    console.log("🔄 INICIANDO MIGRACIÓN AUTOMÁTICA...");
    logger.info('MIGRATION', 'Verificando estructura de base de datos');
    
    try {
      // Verificar si existe la tabla users
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      
      // Verificar si existe la tabla roles
      const rolesRef = ref(database, 'roles');
      const rolesSnapshot = await get(rolesRef);
      
      let needsMigration = false;
      
      if (!usersSnapshot.exists()) {
        console.log("❌ TABLA 'users' NO EXISTE - Creando...");
        logger.warning('MIGRATION', 'Tabla users no encontrada');
        needsMigration = true;
      } else {
        console.log("✅ TABLA 'users' EXISTE");
        logger.success('MIGRATION', 'Tabla users encontrada');
      }
      
      if (!rolesSnapshot.exists()) {
        console.log("❌ TABLA 'roles' NO EXISTE - Creando...");
        logger.warning('MIGRATION', 'Tabla roles no encontrada');
        needsMigration = true;
      } else {
        console.log("✅ TABLA 'roles' EXISTE");
        logger.success('MIGRATION', 'Tabla roles encontrada');
      }
      
      if (needsMigration) {
        await this.runMigration();
      } else {
        console.log("✅ BASE DE DATOS YA ESTÁ CONFIGURADA");
        logger.info('MIGRATION', 'Base de datos ya configurada');
      }
      
    } catch (error) {
      console.error("❌ ERROR EN MIGRACIÓN:", error);
      logger.error('MIGRATION', 'Error en migración', { error: error.message });
    }
  },

  async runMigration() {
    console.log("🚀 EJECUTANDO MIGRACIÓN COMPLETA...");
    logger.info('MIGRATION', 'Iniciando migración completa');
    
    try {
      // 1. Crear tabla de roles
      await this.createRolesTable();
      
      // 2. Crear usuarios por defecto (esto también crea la tabla users)
      await this.createUsersWithSeeders();
      
      // 3. Crear estructura inicial
      await this.createInitialStructure();
      
      console.log("🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE");
      logger.success('MIGRATION', 'Migración completada exitosamente');
      
    } catch (error) {
      console.error("❌ ERROR EJECUTANDO MIGRACIÓN:", error);
      logger.error('MIGRATION', 'Error ejecutando migración', { error: error.message });
      throw error;
    }
  },

  async createRolesTable() {
    console.log("📋 CREANDO TABLA 'roles'...");
    logger.info('MIGRATION', 'Creando tabla roles');
    
    try {
      await set(ref(database, 'roles'), ROLE_PERMISSIONS);
      console.log("✅ TABLA 'roles' CREADA");
      logger.success('MIGRATION', 'Tabla roles creada', { roles: Object.keys(ROLE_PERMISSIONS) });
    } catch (error) {
      console.error("❌ ERROR CREANDO TABLA 'roles':", error);
      logger.error('MIGRATION', 'Error creando tabla roles', { error: error.message });
      throw error;
    }
  },

  async createUsersWithSeeders() {
    console.log("👥 CREANDO USUARIOS POR DEFECTO...");
    logger.info('MIGRATION', 'Ejecutando seeders de usuarios (solo DB)');
    
    try {
      const result = await seedUsersDB();
      console.log("✅ USUARIOS CREADOS:", result);
      logger.success('MIGRATION', 'Seeders ejecutados', result);
    } catch (error) {
      console.error("❌ ERROR CREANDO USUARIOS:", error);
      logger.error('MIGRATION', 'Error en seeders', { error: error.message });
      throw error;
    }
  },

  async createInitialStructure() {
    console.log("🏗️ CREANDO ESTRUCTURA INICIAL...");
    logger.info('MIGRATION', 'Creando estructura inicial de base de datos');
    
    try {
      const initialData = {
        app_info: {
          name: "La Cantina del Charro",
          version: "1.0.0",
          created_at: new Date().toISOString(),
          last_migration: new Date().toISOString()
        },
        categories: {
          tequila: { name: "Tequila", icon: "🥃", active: true },
          mezcal: { name: "Mezcal", icon: "🍶", active: true },
          cerveza: { name: "Cerveza", icon: "🍺", active: true },
          cocktails: { name: "Cocktails", icon: "🍹", active: true }
        }
      };
      
      // Crear estructura solo si no existe
      for (const [key, value] of Object.entries(initialData)) {
        const snapshot = await get(ref(database, key));
        if (!snapshot.exists()) {
          await set(ref(database, key), value);
          console.log(`✅ ESTRUCTURA '${key}' CREADA`);
          logger.success('MIGRATION', `Estructura ${key} creada`);
        }
      }
      
    } catch (error) {
      console.error("❌ ERROR CREANDO ESTRUCTURA:", error);
      logger.error('MIGRATION', 'Error creando estructura inicial', { error: error.message });
      throw error;
    }
  }
};