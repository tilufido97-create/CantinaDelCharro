import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseProductService from '../services/firebaseProductService';

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

export const validateCart = async () => {
  try {
    const cart = await getCart();
    const currentProducts = await firebaseProductService.getProducts();
    
    const validCart = cart.filter(item => {
      const productId = item.product?.id || item.id;
      return currentProducts.find(p => p.id === productId);
    });
    
    if (validCart.length !== cart.length) {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(validCart));
      const removedCount = cart.length - validCart.length;
      console.log(`🗑️ ${removedCount} producto(s) eliminado(s) del carrito (ya no disponibles)`);
      return {
        removedItems: removedCount,
        validCart
      };
    }
    
    return { removedItems: 0, validCart: cart };
  } catch (error) {
    console.error('Error validating cart:', error);
    return { removedItems: 0, validCart: [] };
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
