import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPER_ADMIN = {
  email: 'nicolaspc97@gmail.com',
  name: 'Nicolás Pinto',
  role: 'SUPER_ADMIN',
  permissions: ['*'],
  avatar: null,
  createdAt: '2026-01-01T00:00:00.000Z'
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

export const getAdmins = async () => {
  const adminsData = await AsyncStorage.getItem('admins_list');
  return adminsData ? JSON.parse(adminsData) : [];
};

export const addAdmin = async (email, name, role, createdBy) => {
  const admins = await getAdmins();
  const newAdmin = {
    id: `admin_${Date.now()}`,
    email,
    name,
    role,
    password: 'Admin123!',
    permissions: [],
    avatar: null,
    createdAt: new Date().toISOString(),
    createdBy
  };
  admins.push(newAdmin);
  await AsyncStorage.setItem('admins_list', JSON.stringify(admins));
  return newAdmin;
};

export const removeAdmin = async (email, currentUserEmail) => {
  if (email === currentUserEmail) {
    return { success: false, error: 'No puedes eliminarte a ti mismo' };
  }
  if (isSuperAdmin(email)) {
    return { success: false, error: 'No puedes eliminar al SUPER_ADMIN' };
  }
  const admins = await getAdmins();
  const filtered = admins.filter(a => a.email !== email);
  await AsyncStorage.setItem('admins_list', JSON.stringify(filtered));
  return { success: true };
};

export const changePassword = async (email, currentPassword, newPassword) => {
  if (isSuperAdmin(email)) {
    return { success: false, error: 'Contacta al desarrollador para cambiar contraseña de SUPER_ADMIN' };
  }
  const admins = await getAdmins();
  const admin = admins.find(a => a.email === email);
  if (!admin || admin.password !== currentPassword) {
    return { success: false, error: 'Contraseña actual incorrecta' };
  }
  admin.password = newPassword;
  await AsyncStorage.setItem('admins_list', JSON.stringify(admins));
  return { success: true };
};
