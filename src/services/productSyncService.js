import AsyncStorage from '@react-native-async-storage/async-storage';

class ProductSyncService {
  constructor() {
    this.listeners = [];
    this.syncInterval = null;
    this.lastSyncTimestamp = null;
  }

  startSync() {
    if (this.syncInterval) return;
    
    console.log('🔄 Iniciando sincronización automática cada 3 segundos');
    this.syncInterval = setInterval(() => {
      this.syncProducts();
    }, 3000);
  }

  stopSync() {
    if (this.syncInterval) {
      console.log('⏹️ Deteniendo sincronización');
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncProducts() {
    try {
      const serverProducts = await this.getServerProducts();
      const localProducts = await this.getLocalProducts();
      const changes = this.detectChanges(localProducts, serverProducts);
      
      if (changes.hasChanges) {
        console.log('📦 Cambios detectados:', {
          agregados: changes.added.length,
          eliminados: changes.removed.length,
          actualizados: changes.updated.length
        });
        
        await this.updateLocalProducts(serverProducts);
        this.notifyListeners(changes);
      }
      
      this.lastSyncTimestamp = Date.now();
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    }
  }

  async getServerProducts() {
    const stored = await AsyncStorage.getItem('admin_products');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const allProducts = await AsyncStorage.getItem('all_products');
    return allProducts ? JSON.parse(allProducts) : [];
  }

  async getLocalProducts() {
    const stored = await AsyncStorage.getItem('catalog_products');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const allProducts = await AsyncStorage.getItem('all_products');
    return allProducts ? JSON.parse(allProducts) : [];
  }

  detectChanges(local, server) {
    const changes = {
      hasChanges: false,
      added: [],
      removed: [],
      updated: []
    };

    server.forEach(serverProduct => {
      const existsLocally = local.find(p => p.id === serverProduct.id);
      if (!existsLocally) {
        changes.added.push(serverProduct);
        changes.hasChanges = true;
      } else {
        const wasUpdated = this.productWasUpdated(existsLocally, serverProduct);
        if (wasUpdated) {
          changes.updated.push(serverProduct);
          changes.hasChanges = true;
        }
      }
    });

    local.forEach(localProduct => {
      const existsInServer = server.find(p => p.id === localProduct.id);
      if (!existsInServer) {
        changes.removed.push(localProduct);
        changes.hasChanges = true;
      }
    });

    return changes;
  }

  productWasUpdated(local, server) {
    const localName = local.nombre || local.name;
    const serverName = server.nombre || server.name;
    const localPrice = local.precio || local.price;
    const serverPrice = server.precio || server.price;
    const localStock = local.stock;
    const serverStock = server.stock;
    
    return (
      localName !== serverName ||
      localPrice !== serverPrice ||
      localStock !== serverStock ||
      (local.categoria || local.category) !== (server.categoria || server.category) ||
      (local.imagenURL || local.image) !== (server.imagenURL || server.image) ||
      (local.descripcion || local.description) !== (server.descripcion || server.description)
    );
  }

  async updateLocalProducts(products) {
    await AsyncStorage.setItem('catalog_products', JSON.stringify(products));
    await AsyncStorage.setItem('all_products', JSON.stringify(products));
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners(changes) {
    this.listeners.forEach(callback => callback(changes));
  }

  async addProductFromAdmin(product) {
    const products = await this.getServerProducts();
    products.push({
      ...product,
      id: product.id || `product_${Date.now()}`,
      createdAt: new Date().toISOString()
    });
    await AsyncStorage.setItem('admin_products', JSON.stringify(products));
    await AsyncStorage.setItem('all_products', JSON.stringify(products));
    await this.syncProducts();
  }

  async deleteProductFromAdmin(productId) {
    const products = await this.getServerProducts();
    const filtered = products.filter(p => p.id !== productId);
    await AsyncStorage.setItem('admin_products', JSON.stringify(filtered));
    await AsyncStorage.setItem('all_products', JSON.stringify(filtered));
    await this.syncProducts();
  }

  async updateProductFromAdmin(productId, updates) {
    const products = await this.getServerProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem('admin_products', JSON.stringify(products));
      await AsyncStorage.setItem('all_products', JSON.stringify(products));
      await this.syncProducts();
    }
  }
}

export default new ProductSyncService();
