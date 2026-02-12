import { ref, set, get } from "firebase/database";
import { database } from "../config/firebase";
import { ROLES } from "../config/roles";
import { logger } from "../utils/logger";

const defaultUsers = [
  {
    id: "user_super_admin_001",
    email: "nicolaspc97@gmail.com",
    password: "Admin123!",
    userData: {
      name: "Nicolás Pinto",
      role: ROLES.ADMIN,
      phone: "+591 70000001",
      age: 27,
      preferences: {
        favoriteCategory: "tequila",
        notifications: true
      }
    }
  },
  {
    id: "user_admin_001",
    email: "titanmia2016@gmail.com",
    password: "$hadowFury2002",
    userData: {
      name: "Adrian Pinto",
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
  let updatedCount = 0;
  
  for (const user of defaultUsers) {
    try {
      console.log(`📝 Procesando: ${user.email}`);
      logger.info('SEEDER', `Procesando usuario: ${user.email}`);
      
      // Verificar si el usuario ya existe
      const userRef = ref(database, `users/${user.id}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        // Actualizar usuario existente
        await set(userRef, {
          id: user.id,
          email: user.email,
          password: user.password,
          ...user.userData,
          createdAt: snapshot.val().createdAt || new Date().toISOString(),
          lastLogin: snapshot.val().lastLogin,
          isActive: true
        });
        console.log(`✅ Usuario actualizado: ${user.email}`);
        updatedCount++;
        continue;
      }
      
      // Crear usuario en Realtime Database
      await set(userRef, {
        id: user.id,
        email: user.email,
        password: user.password,
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
    updated: updatedCount,
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
    console.log(`🔑 Password length: ${password.length}`);
    
    // Buscar usuario por email (case insensitive)
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No hay usuarios en la base de datos');
      throw new Error('No hay usuarios en la base de datos');
    }
    
    const users = snapshot.val();
    console.log(`📊 Total usuarios en DB: ${Object.keys(users).length}`);
    
    const userEntry = Object.entries(users).find(([id, userData]) => {
      const emailMatch = userData.email?.toLowerCase() === email.toLowerCase();
      const passwordMatch = userData.password === password;
      console.log(`🔍 Comparando con ${userData.email}: email=${emailMatch}, password=${passwordMatch}`);
      return emailMatch && passwordMatch;
    });
    
    if (!userEntry) {
      console.log('❌ Credenciales incorrectas');
      throw new Error('Credenciales incorrectas');
    }
    
    const [userId, userData] = userEntry;
    console.log(`✅ Usuario encontrado: ${userData.name} (${userData.role})`);
    
    // Actualizar último login
    await set(ref(database, `users/${userId}/lastLogin`), new Date().toISOString());
    
    // Agregar permissions según el rol
    const permissions = userData.role === ROLES.ADMIN ? ['*'] : 
                       userData.role === ROLES.REPARTIDOR ? ['manage_products', 'manage_orders', 'approve_deliveries', 'manage_promos'] :
                       userData.role === ROLES.REPONEDOR ? ['manage_products', 'manage_orders', 'approve_deliveries', 'manage_promos'] : [];
    
    console.log(`✅ Login exitoso: ${email}`);
    return {
      success: true,
      user: { id: userId, email: userData.email },
      userData: { ...userData, permissions }
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