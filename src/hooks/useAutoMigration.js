import { useEffect, useState } from 'react';
import { migrationService } from '../services/migrationService';
import { logger } from '../utils/logger';

export const useAutoMigration = () => {
  const [migrationStatus, setMigrationStatus] = useState({
    isRunning: false,
    isComplete: false,
    hasError: false,
    error: null
  });

  useEffect(() => {
    const runAutoMigration = async () => {
      console.log("🚀 APP INICIADA - Verificando base de datos...");
      logger.info('APP', 'Aplicación iniciada - Verificando migración');
      
      setMigrationStatus(prev => ({ ...prev, isRunning: true }));
      
      try {
        await migrationService.checkAndMigrate();
        
        setMigrationStatus({
          isRunning: false,
          isComplete: true,
          hasError: false,
          error: null
        });
        
        console.log("✅ MIGRACIÓN AUTOMÁTICA COMPLETADA");
        logger.success('APP', 'Migración automática completada');
        
      } catch (error) {
        console.error("❌ ERROR EN MIGRACIÓN AUTOMÁTICA:", error);
        logger.error('APP', 'Error en migración automática', { error: error.message });
        
        setMigrationStatus({
          isRunning: false,
          isComplete: false,
          hasError: true,
          error: error.message
        });
      }
    };

    runAutoMigration();
  }, []);

  return migrationStatus;
};