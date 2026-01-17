import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = '@cantina_cart';

export const getCart = async () => {
  try {
    const cart = await AsyncStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

export const addToCart = async (product, quantity = 1) => {
  try {
    const cart = await getCart();
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return [];
  }
};

export const removeFromCart = async (productId) => {
  try {
    let cart = await getCart();
    cart = cart.filter(item => item.product.id !== productId);
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return [];
  }
};

export const updateQuantity = async (productId, quantity) => {
  try {
    const cart = await getCart();
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        return removeFromCart(productId);
      }
      cart[itemIndex].quantity = quantity;
    }
    
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error updating quantity:', error);
    return [];
  }
};

export const getCartTotal = async () => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  } catch (error) {
    console.error('Error getting cart total:', error);
    return 0;
  }
};

export const getCartCount = async () => {
  try {
    const cart = await getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};
