import { ref, set, get, push } from 'firebase/database';
import { database } from '../config/firebase';
import { DB_PATHS } from './databaseService';

// Initial Admin Users
const ADMIN_USERS = [
  {
    email: 'pintocalvettyadrianchristian@gmail.com',
    password: 'Thiago100217*',
    name: 'Adrian Christian Pinto Calvetti',
    role: 'admin',
    phone: '+1234567890',
    isActive: true,
    permissions: ['all', 'users', 'products', 'orders', 'analytics', 'settings']
  },
  {
    email: 'tilufido97@gmail.com',
    password: 'Thiago100217*',
    name: 'Admin User 2',
    role: 'admin', 
    phone: '+1234567891',
    isActive: true,
    permissions: ['all', 'users', 'products', 'orders', 'analytics', 'settings']
  }
];

// Product Categories
const CATEGORIES = [
  { name: 'Tequilas', description: 'Tequilas premium y tradicionales', icon: '🥃', isActive: true },
  { name: 'Cervezas', description: 'Cervezas nacionales e importadas', icon: '🍺', isActive: true },
  { name: 'Mezcales', description: 'Mezcales artesanales', icon: '🍶', isActive: true },
  { name: 'Whiskeys', description: 'Whiskeys y bourbons', icon: '🥃', isActive: true },
  { name: 'Vodkas', description: 'Vodkas premium', icon: '🍸', isActive: true },
  { name: 'Rones', description: 'Rones añejos y blancos', icon: '🍹', isActive: true },
  { name: 'Botanas', description: 'Botanas y snacks', icon: '🥨', isActive: true },
  { name: 'Mixers', description: 'Refrescos y mixers', icon: '🥤', isActive: true }
];

// Sample Products
const PRODUCTS = [
  {
    name: 'Tequila Don Julio 1942',
    description: 'Tequila añejo premium',
    price: 2500,
    categoryId: '',
    image: 'tequila_don_julio.jpg',
    stock: 50,
    isActive: true,
    alcoholContent: 40,
    volume: 750
  },
  {
    name: 'Corona Extra',
    description: 'Cerveza mexicana clásica',
    price: 45,
    categoryId: '',
    image: 'corona_extra.jpg',
    stock: 200,
    isActive: true,
    alcoholContent: 4.5,
    volume: 355
  },
  {
    name: 'Mezcal Montelobos',
    description: 'Mezcal artesanal de Oaxaca',
    price: 800,
    categoryId: '',
    image: 'mezcal_montelobos.jpg',
    stock: 30,
    isActive: true,
    alcoholContent: 43.2,
    volume: 750
  }
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seeder de base de datos...');

    // Check if data already exists
    try {
      const usersSnapshot = await get(ref(database, DB_PATHS.USERS));
      if (usersSnapshot.exists()) {
        console.log('⚠️ La base de datos ya contiene datos. Saltando seeder.');
        return;
      }
    } catch (permissionError) {
      if (permissionError.message.includes('Permission denied')) {
        console.error('🚫 Error de permisos en Firebase.');
        console.error('Ve a Firebase Console y configura las reglas de la base de datos.');
        console.error('URL: https://console.firebase.google.com/project/cantinadelcharro/database/cantinadelcharro-default-rtdb/rules');
        console.error('Reglas temporales para desarrollo:');
        console.error('{ "rules": { ".read": true, ".write": true } }');
        throw new Error('Configura las reglas de Firebase Realtime Database');
      }
      console.log('🔄 Primera ejecución, continuando con seeder...');
    }

    // Seed Admin Users
    console.log('👥 Creando usuarios administradores...');
    for (const user of ADMIN_USERS) {
      const userRef = push(ref(database, DB_PATHS.USERS));
      await set(userRef, {
        ...user,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    // Seed Categories
    console.log('📂 Creando categorías...');
    const categoryIds = {};
    for (const category of CATEGORIES) {
      const categoryRef = push(ref(database, DB_PATHS.CATEGORIES));
      await set(categoryRef, {
        ...category,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      categoryIds[category.name] = categoryRef.key;
    }

    // Seed Products
    console.log('🍺 Creando productos...');
    const productsWithCategories = PRODUCTS.map(product => ({
      ...product,
      categoryId: categoryIds[product.name.includes('Tequila') ? 'Tequilas' : 
                              product.name.includes('Corona') ? 'Cervezas' : 'Mezcales'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    for (const product of productsWithCategories) {
      const productRef = push(ref(database, DB_PATHS.PRODUCTS));
      await set(productRef, product);
    }

    // Seed Promotions
    console.log('🎁 Creando promociones...');
    const promotions = [
      {
        title: 'Happy Hour',
        description: '2x1 en cervezas seleccionadas',
        discountType: 'percentage',
        discountValue: 50,
        startTime: '18:00',
        endTime: '20:00',
        isActive: true,
        validDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      {
        title: 'Fin de Semana Tequilero',
        description: '20% de descuento en tequilas',
        discountType: 'percentage',
        discountValue: 20,
        isActive: true,
        validDays: ['friday', 'saturday', 'sunday']
      }
    ];

    for (const promotion of promotions) {
      const promotionRef = push(ref(database, DB_PATHS.PROMOTIONS));
      await set(promotionRef, {
        ...promotion,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    console.log('✅ Seeder completado exitosamente!');
    console.log('📧 Usuarios admin creados:');
    ADMIN_USERS.forEach(user => console.log(`   - ${user.email}`));

  } catch (error) {
    console.error('❌ Error en seeder:', error);
    throw error;
  }
};

export const checkAdminUser = async (email) => {
  const usersSnapshot = await get(ref(database, DB_PATHS.USERS));
  if (!usersSnapshot.exists()) return false;
  
  let isAdmin = false;
  usersSnapshot.forEach(child => {
    const user = child.val();
    if (user.email === email && user.role === 'admin') {
      isAdmin = true;
    }
  });
  return isAdmin;
};