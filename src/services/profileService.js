import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadProfileData = async () => {
  try {
    const data = await AsyncStorage.getItem('user_profile');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error cargando perfil:', error);
    return null;
  }
};

export const saveProfileData = async (profileData) => {
  try {
    await AsyncStorage.setItem('user_profile', JSON.stringify(profileData));
    return { success: true };
  } catch (error) {
    console.error('Error guardando perfil:', error);
    return { success: false, error };
  }
};

export const updateAvatar = async (avatarId) => {
  try {
    const profile = await loadProfileData();
    if (!profile) return { success: false };
    profile.avatar = avatarId;
    await saveProfileData(profile);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const updateName = async (firstName, lastName) => {
  try {
    const profile = await loadProfileData();
    if (!profile) return { success: false };
    profile.firstName = firstName;
    profile.lastName = lastName;
    await saveProfileData(profile);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const updatePhone = async (phone, countryCode) => {
  try {
    const profile = await loadProfileData();
    if (!profile) return { success: false };
    profile.phone = phone;
    profile.countryCode = countryCode;
    await saveProfileData(profile);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
