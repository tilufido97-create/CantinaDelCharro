import AsyncStorage from '@react-native-async-storage/async-storage';

export const LEVELS = {
  bronze: { name: 'Bronce', emoji: '🥉', minPoints: 0, maxPoints: 999, benefits: ['Puntos por compras'], discount: 0 },
  silver: { name: 'Plata', emoji: '🥈', minPoints: 1000, maxPoints: 2999, benefits: ['5% descuento', 'Puntos x1.5'], discount: 5 },
  gold: { name: 'Oro', emoji: '🥇', minPoints: 3000, maxPoints: 5999, benefits: ['10% descuento', 'Envío gratis', 'Puntos x2'], discount: 10 },
  platinum: { name: 'Platino', emoji: '💎', minPoints: 6000, maxPoints: Infinity, benefits: ['15% descuento', 'Envío gratis', 'Acceso VIP', 'Puntos x3'], discount: 15 },
};

export const getUserLevel = (points) => {
  if (points >= 6000) return 'platinum';
  if (points >= 3000) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
};

export const getLevelProgress = (points) => {
  const level = getUserLevel(points);
  const levelData = LEVELS[level];
  
  if (level === 'platinum') return { progress: 1, pointsToNext: 0, nextLevel: null };
  
  const nextLevelKey = level === 'bronze' ? 'silver' : level === 'silver' ? 'gold' : 'platinum';
  const nextLevel = LEVELS[nextLevelKey];
  const progress = (points - levelData.minPoints) / (nextLevel.minPoints - levelData.minPoints);
  
  return { progress, pointsToNext: nextLevel.minPoints - points, nextLevel: nextLevel.name };
};

export const addPoints = async (userId, points, type, description) => {
  try {
    const data = await AsyncStorage.getItem('user_loyalty');
    const userData = data ? JSON.parse(data) : { userId, points: 0, totalEarned: 0, totalSpent: 0, referralCode: generateReferralCode(userId), referralsCount: 0 };
    
    userData.points += points;
    userData.totalEarned += points > 0 ? points : 0;
    userData.totalSpent += points < 0 ? Math.abs(points) : 0;
    userData.level = getUserLevel(userData.points);
    
    await AsyncStorage.setItem('user_loyalty', JSON.stringify(userData));
    
    const activity = { id: Date.now().toString(), type, points, description, timestamp: Date.now() };
    const activities = await getActivities();
    activities.unshift(activity);
    await AsyncStorage.setItem('points_activities', JSON.stringify(activities.slice(0, 50)));
    
    return userData;
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
};

export const redeemReward = async (userId, reward) => {
  const data = await AsyncStorage.getItem('user_loyalty');
  const userData = JSON.parse(data);
  
  if (userData.points < reward.pointsCost) {
    throw new Error('Puntos insuficientes');
  }
  
  return await addPoints(userId, -reward.pointsCost, 'redeem', `Canjeaste: ${reward.title}`);
};

export const generateReferralCode = (userId) => {
  return `CHARRO-${userId.substring(0, 6).toUpperCase()}`;
};

export const processReferral = async (referrerCode, newUserId) => {
  await addPoints(referrerCode.split('-')[1], 200, 'referral', 'Nuevo referido completó compra');
  await addPoints(newUserId, 200, 'bonus', 'Bono de bienvenida por referido');
};

export const getActivities = async () => {
  try {
    const data = await AsyncStorage.getItem('points_activities');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const getUserData = async () => {
  try {
    const data = await AsyncStorage.getItem('user_loyalty');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};
