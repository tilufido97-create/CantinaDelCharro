const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Almacenamiento temporal de códigos OTP
const otpStorage = new Map();

// Generar código OTP de 6 dígitos
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función HTTP para enviar SMS
exports.sendSMS = functions.https.onRequest(async (req, res) => {
  // Habilitar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const { phoneNumber, appName } = req.body;
    
    console.log('📱 Enviando SMS a:', phoneNumber);
    
    // Generar código OTP
    const otpCode = generateOTP();
    const verificationId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Guardar código temporalmente (expira en 5 minutos)
    otpStorage.set(verificationId, {
      phoneNumber: phoneNumber,
      code: otpCode,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutos
      attempts: 0
    });
    
    // Por ahora simular envío (aquí integrarías Twilio/AWS SNS/etc)
    console.log(`✅ SMS simulado enviado a ${phoneNumber} con código: ${otpCode}`);
    
    res.json({
      success: true,
      verificationId: verificationId,
      message: 'SMS enviado exitosamente',
      // En desarrollo, devolver el código para testing
      testCode: otpCode
    });
    
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Función HTTP para verificar SMS
exports.verifySMS = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    const { verificationId, code } = req.body;
    
    console.log('🔐 Verificando código:', code);
    
    const storedData = otpStorage.get(verificationId);
    
    if (!storedData) {
      return res.status(404).json({ success: false, error: 'Verificación no encontrada' });
    }
    
    // Verificar si el código expiró
    if (Date.now() > storedData.expires) {
      otpStorage.delete(verificationId);
      return res.status(400).json({ success: false, error: 'Código expirado' });
    }
    
    // Verificar intentos
    if (storedData.attempts >= 3) {
      otpStorage.delete(verificationId);
      return res.status(400).json({ success: false, error: 'Demasiados intentos' });
    }
    
    // Verificar código
    if (code !== storedData.code) {
      storedData.attempts += 1;
      otpStorage.set(verificationId, storedData);
      return res.status(400).json({ 
        success: false, 
        error: `Código incorrecto. Intentos restantes: ${3 - storedData.attempts}` 
      });
    }
    
    // Código correcto - crear/obtener usuario
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByPhoneNumber(storedData.phoneNumber);
    } catch (error) {
      // Usuario no existe, crearlo
      userRecord = await admin.auth().createUser({
        phoneNumber: storedData.phoneNumber
      });
    }
    
    // Limpiar código usado
    otpStorage.delete(verificationId);
    
    console.log('✅ Usuario autenticado:', userRecord.uid);
    
    res.json({
      success: true,
      uid: userRecord.uid,
      phoneNumber: storedData.phoneNumber
    });
    
  } catch (error) {
    console.error('❌ Error verificando código:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});