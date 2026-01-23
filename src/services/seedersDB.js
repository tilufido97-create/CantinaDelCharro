import { ref, set, get } from "firebase/database";
import { database } from "../config/firebase";
import { ROLES } from "../config/roles";
import { logger } from "../utils/logger";

const defaultUsers = [
  {
    id: "user_admin_001",
    email: "tilufido97@gmail.com",
    password: "123456", // En producción esto debería estar hasheado
    userData: {
      name: "Usuario Tilufido",
      role: ROLES.ADMIN,
      phone: "+52 123 456 7890",
      age: 25,
      preferences: {
        favoriteCategory: "tequila",
        notifications: true
      }
    }
  },
  {
    id: "user_repartidor_001",
    email: "pintocalvettyadrianchristian@gmail.com", 
    password: "123456",
    userData: {
      name: "Adrian Christian",
      role: ROLES.REPARTIDOR,
      phone: "+52 098 765 4321",
      age: 28,
      preferences: {
        favoriteCategory: "mezcal",
        notifications: true
      }
    }
  },
  {
    id: "user_reponedor_001",
    email: "reponedor@cantinadelcharro.com",
    password: "123456", 
    userData: {
      name: "Carlos Reponedor",
      role: ROLES.REPONEDOR,
      phone: "+52 555 123 4567",
      age: 30,
      preferences: {
        favoriteCategory: "cerveza",
        notifications: true
      }
    }
  },
  {
    id: "user_customer_001",
    email: "cliente@cantinadelcharro.com",
    password: "123456",
    userData: {
      name: "María Cliente",
      role: ROLES.CUSTOMER,
      phone: "+52 555 987 6543", 
      age: 26,
      preferences: {
        favoriteCategory: "cocktails",
        notifications: false
      }
    }
  }
];

export const seedUsersDB = async () => {
  logger.seederStart();
  console.log("🌱 INICIANDO SEEDER DE USUARIOS (SOLO DATABASE)...");
  
  let createdCount = 0;
  let existingCount = 0;
  let errorCount = 0;
  
  for (const user of defaultUsers) {
    try {
      console.log(`📝 Procesando: ${user.email}`);
      logger.info('SEEDER', `Procesando usuario: ${user.email}`);
      
      // Verificar si el usuario ya existe
      const userRef = ref(database, `users/${user.id}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        console.log(`⚠️ Usuario ya existe: ${user.email}`);
        logger.seederUserExists(user.email);
        existingCount++;
        continue;
      }
      
      // Crear usuario en Realtime Database
      await set(userRef, {
        id: user.id,
        email: user.email,
        password: user.password, // En producción usar hash
        ...user.userData,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      });
      
      console.log(`✅ Usuario creado en DB: ${user.email}`);
      logger.seederUserCreated(user.email, user.userData.role);
      createdCount++;
      
    } catch (error) {
      console.error(`❌ Error creando ${user.email}:`, error.message);
      logger.error('SEEDER', `Error creando usuario ${user.email}`, {
        email: user.email,
        error: error.message
      });
      errorCount++;
    }
  }
  
  const result = {
    total: defaultUsers.length,
    created: createdCount,
    existing: existingCount,
    errors: errorCount
  };
  
  console.log("🎉 SEEDER COMPLETADO:", result);
  logger.success('SEEDER', 'Proceso completado', result);
  logger.seederComplete();
  
  return result;
};

// Función para login simple con base de datos
export const loginWithDB = async (email, password) => {
  try {
    console.log(`🔐 Intentando login con DB: ${email}`);
    
    // Buscar usuario por email
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      throw new Error('No hay usuarios en la base de datos');
    }
    
    const users = snapshot.val();
    const userEntry = Object.entries(users).find(([id, userData]) => 
      userData.email === email && userData.password === password
    );
    
    if (!userEntry) {
      throw new Error('Credenciales incorrectas');
    }
    
    const [userId, userData] = userEntry;
    
    // Actualizar último login
    await set(ref(database, `users/${userId}/lastLogin`), new Date().toISOString());
    
    console.log(`✅ Login exitoso: ${email}`);
    return {
      success: true,
      user: { id: userId, email: userData.email },
      userData
    };
    
  } catch (error) {
    console.error(`❌ Error en login: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getDefaultUsers = () => defaultUsers;