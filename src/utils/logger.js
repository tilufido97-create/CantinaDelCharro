class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(level, category, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data
    };

    // Agregar a array interno
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Console log con formato
    const emoji = this.getEmoji(level);
    const formattedMessage = `${emoji} [${category.toUpperCase()}] ${message}`;
    
    console.log(`\n=== ${timestamp} ===`);
    console.log(formattedMessage);
    if (data) {
      console.log('📊 Datos:', JSON.stringify(data, null, 2));
    }
    console.log('================================\n');
  }

  getEmoji(level) {
    const emojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    };
    return emojis[level] || 'ℹ️';
  }

  info(category, message, data) {
    this.log('info', category, message, data);
  }

  success(category, message, data) {
    this.log('success', category, message, data);
  }

  warning(category, message, data) {
    this.log('warning', category, message, data);
  }

  error(category, message, data) {
    this.log('error', category, message, data);
  }

  debug(category, message, data) {
    this.log('debug', category, message, data);
  }

  // Métodos específicos para auth
  authAttempt(email) {
    this.info('AUTH', `Intento de login para: ${email}`);
  }

  authSuccess(email, role, uid) {
    this.success('AUTH', `Login exitoso para: ${email}`, {
      email,
      role,
      uid,
      timestamp: new Date().toISOString()
    });
  }

  authFailed(email, error) {
    this.error('AUTH', `Login fallido para: ${email}`, {
      email,
      error,
      timestamp: new Date().toISOString()
    });
  }

  seederStart() {
    this.info('SEEDER', 'Iniciando creación de usuarios por defecto...');
  }

  seederUserCreated(email, role) {
    this.success('SEEDER', `Usuario creado: ${email}`, { email, role });
  }

  seederUserExists(email) {
    this.warning('SEEDER', `Usuario ya existe: ${email}`, { email });
  }

  seederComplete() {
    this.success('SEEDER', 'Seeder completado exitosamente');
  }

  seederError(error) {
    this.error('SEEDER', 'Error en seeder', { error: error.message });
  }

  // Obtener logs
  getLogs() {
    return this.logs;
  }

  // Limpiar logs
  clearLogs() {
    this.logs = [];
    this.info('SYSTEM', 'Logs limpiados');
  }
}

export const logger = new Logger();