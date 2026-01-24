import { database } from '../config/firebase';
import { ref, onValue, set, push, remove, update, get } from 'firebase/database';

class ProductService {
  constructor() {
    this.productsRef = ref(database, 'products');
  }

  subscribeToProducts(callback) {
    const unsubscribe = onValue(this.productsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        callback([]);
        return;
      }

      const productsArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));

      // Filtrar solo productos activos (no eliminados)
      // Mostrar productos aunque no estén disponibles o sin stock
      const activeProducts = productsArray.filter(p => p.active !== false);
      
      console.log('📦 Firebase: Productos activos:', activeProducts.length, 'de', productsArray.length);
      callback(activeProducts);
    }, (error) => {
      console.error('❌ Error al escuchar productos:', error);
      callback([]);
    });

    return unsubscribe;
  }

  async getProducts() {
    try {
      const snapshot = await get(this.productsRef);
      const data = snapshot.val();
      if (!data) return [];
      
      const productsArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      
      return productsArray.filter(p => p.active !== false);
    } catch (error) {
      console.error('❌ Error al obtener productos:', error);
      return [];
    }
  }

  async addProduct(productData) {
    try {
      const newProductRef = push(this.productsRef);
      const productId = newProductRef.key;

      const newProduct = {
        id: productId,
        name: productData.name,
        category: productData.category,
        cost: parseFloat(productData.cost) || 0,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock) || 0,
        minStock: parseInt(productData.minStock) || 0,
        image: productData.images?.[0] || productData.image || 'https://via.placeholder.com/200',
        description: productData.description || '',
        discount: parseFloat(productData.discount) || 0,
        disponible: productData.disponible !== false,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newProductRef, newProduct);
      console.log('✅ Producto agregado:', productId);
      return { success: true, productId, product: newProduct };
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProduct(productId, updates) {
    try {
      const productRef = ref(database, `products/${productId}`);
      
      const updatedData = {
        ...updates,
        cost: updates.cost ? parseFloat(updates.cost) : undefined,
        price: parseFloat(updates.price),
        stock: parseInt(updates.stock),
        minStock: updates.minStock ? parseInt(updates.minStock) : undefined,
        discount: updates.discount ? parseFloat(updates.discount) : 0,
        disponible: updates.disponible !== undefined ? updates.disponible : true,
        updatedAt: new Date().toISOString()
      };

      await update(productRef, updatedData);
      console.log('✅ Producto actualizado:', productId);
      return { success: true, productId };
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteProduct(productId) {
    try {
      const productRef = ref(database, `products/${productId}`);
      await update(productRef, {
        active: false,
        deletedAt: new Date().toISOString()
      });
      
      console.log('✅ Producto eliminado:', productId);
      return { success: true, productId };
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new ProductService();
