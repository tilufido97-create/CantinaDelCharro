import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../config/firebase";
import { ROLES } from "../config/roles";
import { logger } from "../utils/logger";

const defaultUsers = [
  {
    email: "tilufido97@gmail.com",
    password: "123456",
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

export const seedUsers = async () => {
  logger.seederStart();
  console.log("🌱 INICIANDO SEEDER DE USUARIOS...");
  
  let createdCount = 0;
  let existingCount = 0;
  let errorCount = 0;
  
  for (const user of defaultUsers) {
    try {
      console.log(`📝 Procesando: ${user.email}`);
      logger.info('SEEDER', `Procesando usuario: ${user.email}`);
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
      );
      
      const uid = userCredential.user.uid;
      console.log(`✅ Usuario Auth creado: ${uid}`);
      
      // Guardar datos adicionales en Realtime Database
      await set(ref(database, `users/${uid}`), {
        email: user.email,
        ...user.userData,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      });
      
      console.log(`✅ Datos guardados en DB para: ${user.email}`);
      logger.seederUserCreated(user.email, user.userData.role);
      createdCount++;
      
      // Cerrar sesión para no interferir con el login posterior
      await signOut(auth);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ Usuario ya existe: ${user.email}`);
        logger.seederUserExists(user.email);
        existingCount++;
      } else {
        console.error(`❌ Error creando ${user.email}:`, error.message);
        logger.error('SEEDER', `Error creando usuario ${user.email}`, {
          email: user.email,
          error: error.message,
          code: error.code
        });
        errorCount++;
      }
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

export const getUsersTableStructure = () => {
  return {
    users: {
      "[uid]": {
        email: "string",
        name: "string", 
        role: `${ROLES.ADMIN}|${ROLES.REPONEDOR}|${ROLES.REPARTIDOR}|${ROLES.CUSTOMER}`,
        phone: "string",
        age: "number",
        preferences: {
          favoriteCategory: "string",
          notifications: "boolean"
        },
        createdAt: "ISO string",
        lastLogin: "ISO string | null",
        isActive: "boolean"
      }
    }
  };
};

export const getDefaultUsers = () => defaultUsers;