import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPER_ADMIN = {
  email: 'nicolaspc97@gmail.com',
  name: 'Nicolás',
  role: 'SUPER_ADMIN',
  permissions: ['*']
};

export const isSuperAdmin = (email) => {
  return email.toLowerCase() === SUPER_ADMIN.email.toLowerCase();
};

export const loginAdmin = async (email, password) => {
  try {
    if (isSuperAdmin(email)) {
      if (password === 'Admin123!') {
        const adminData = SUPER_ADMIN;
        await AsyncStorage.setItem('admin_user', JSON.stringify(adminData));
        return { success: true, user: adminData };
      }
    }
    
    const adminsData = await AsyncStorage.getItem('admins_list');
    const admins = adminsData ? JSON.parse(adminsData) : [];
    
    const admin = admins.find(a => 
      a.email.toLowerCase() === email.toLowerCase() && 
      a.password === password
    );
    
    if (admin) {
      await AsyncStorage.setItem('admin_user', JSON.stringify(admin));
      return { success: true, user: admin };
    }
    
    return { success: false, error: 'Credenciales inválidas' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutAdmin = async () => {
  await AsyncStorage.removeItem('admin_user');
};

export const getCurrentAdmin = async () => {
  const adminData = await AsyncStorage.getItem('admin_user');
  return adminData ? JSON.parse(adminData) : null;
};

export const isAdminLoggedIn = async () => {
  const admin = await getCurrentAdmin();
  return admin !== null;
};
