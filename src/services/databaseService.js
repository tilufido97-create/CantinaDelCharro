import { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo,
  limitToLast,
  onValue,
  off
} from 'firebase/database';
import { database } from '../config/firebase';

// Database paths
export const DB_PATHS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  ADDRESSES: 'addresses',
  GAME_SCORES: 'game_scores',
  LOYALTY_POINTS: 'loyalty_points',
  NOTIFICATIONS: 'notifications',
  PROMOTIONS: 'promotions',
  REVIEWS: 'reviews'
};

// Users
export const createUser = async (userData) => {
  const userRef = push(ref(database, DB_PATHS.USERS));
  await set(userRef, {
    ...userData,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return userRef.key;
};

export const getUserById = async (userId) => {
  const snapshot = await get(ref(database, `${DB_PATHS.USERS}/${userId}`));
  return snapshot.exists() ? { id: userId, ...snapshot.val() } : null;
};

export const updateUser = async (userId, userData) => {
  await update(ref(database, `${DB_PATHS.USERS}/${userId}`), {
    ...userData,
    updatedAt: Date.now()
  });
};

// Products
export const createProduct = async (productData) => {
  const productRef = push(ref(database, DB_PATHS.PRODUCTS));
  await set(productRef, {
    ...productData,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return productRef.key;
};

export const getProducts = async () => {
  const snapshot = await get(ref(database, DB_PATHS.PRODUCTS));
  if (!snapshot.exists()) return [];
  
  const products = [];
  snapshot.forEach(child => {
    products.push({ id: child.key, ...child.val() });
  });
  return products;
};

export const getProductsByCategory = async (categoryId) => {
  const productsQuery = query(
    ref(database, DB_PATHS.PRODUCTS),
    orderByChild('categoryId'),
    equalTo(categoryId)
  );
  const snapshot = await get(productsQuery);
  
  if (!snapshot.exists()) return [];
  
  const products = [];
  snapshot.forEach(child => {
    products.push({ id: child.key, ...child.val() });
  });
  return products;
};

// Orders
export const createOrder = async (orderData) => {
  const orderRef = push(ref(database, DB_PATHS.ORDERS));
  await set(orderRef, {
    ...orderData,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return orderRef.key;
};

export const getUserOrders = async (userId) => {
  const ordersQuery = query(
    ref(database, DB_PATHS.ORDERS),
    orderByChild('userId'),
    equalTo(userId)
  );
  const snapshot = await get(ordersQuery);
  
  if (!snapshot.exists()) return [];
  
  const orders = [];
  snapshot.forEach(child => {
    orders.push({ id: child.key, ...child.val() });
  });
  return orders.sort((a, b) => b.createdAt - a.createdAt);
};

export const updateOrderStatus = async (orderId, status) => {
  await update(ref(database, `${DB_PATHS.ORDERS}/${orderId}`), {
    status,
    updatedAt: Date.now()
  });
};

// Game Scores
export const saveGameScore = async (scoreData) => {
  const scoreRef = push(ref(database, DB_PATHS.GAME_SCORES));
  await set(scoreRef, {
    ...scoreData,
    createdAt: Date.now()
  });
  return scoreRef.key;
};

export const getGameLeaderboard = async (gameName, limitCount = 10) => {
  const scoresQuery = query(
    ref(database, DB_PATHS.GAME_SCORES),
    orderByChild('gameName'),
    equalTo(gameName)
  );
  const snapshot = await get(scoresQuery);
  
  if (!snapshot.exists()) return [];
  
  const scores = [];
  snapshot.forEach(child => {
    scores.push({ id: child.key, ...child.val() });
  });
  
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limitCount);
};

// Loyalty Points
export const updateLoyaltyPoints = async (userId, points, action) => {
  const pointsRef = push(ref(database, DB_PATHS.LOYALTY_POINTS));
  await set(pointsRef, {
    userId,
    points,
    action,
    createdAt: Date.now()
  });
  return pointsRef.key;
};

export const getUserLoyaltyPoints = async (userId) => {
  const pointsQuery = query(
    ref(database, DB_PATHS.LOYALTY_POINTS),
    orderByChild('userId'),
    equalTo(userId)
  );
  const snapshot = await get(pointsQuery);
  
  if (!snapshot.exists()) return [];
  
  const points = [];
  snapshot.forEach(child => {
    points.push({ id: child.key, ...child.val() });
  });
  return points.sort((a, b) => b.createdAt - a.createdAt);
};

// Real-time listeners
export const listenToOrders = (callback) => {
  const ordersRef = ref(database, DB_PATHS.ORDERS);
  onValue(ordersRef, (snapshot) => {
    const orders = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        orders.push({ id: child.key, ...child.val() });
      });
    }
    callback(orders);
  });
  return () => off(ordersRef);
};

export const listenToGameScores = (gameName, callback) => {
  const scoresQuery = query(
    ref(database, DB_PATHS.GAME_SCORES),
    orderByChild('gameName'),
    equalTo(gameName)
  );
  onValue(scoresQuery, (snapshot) => {
    const scores = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        scores.push({ id: child.key, ...child.val() });
      });
    }
    callback(scores.sort((a, b) => b.score - a.score));
  });
  return () => off(scoresQuery);
};