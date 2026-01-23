import { seedDatabase } from '../services/seederService';

// Execute seeder
const runSeeder = async () => {
  try {
    await seedDatabase();
    console.log('🎉 Base de datos inicializada correctamente');
  } catch (error) {
    console.error('💥 Error inicializando base de datos:', error);
  }
};

export default runSeeder;