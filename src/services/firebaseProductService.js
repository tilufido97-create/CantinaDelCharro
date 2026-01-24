import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { db, storage, COLLECTIONS, STORAGE_PATHS, handleFirebaseError } from '../config/firebaseConfig';

/**
 * Servicio completo de productos con Firebase
 */

// ==================== CRUD OPERATIONS ====================

/**
 * Obtener todos los productos (una vez)
 */
export const getAllProducts = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      orderBy('creadoEn', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${products.length} productos cargados`);
    return products;
    
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener productos activos (para app móvil)
 */
export const getActiveProducts = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('activo', '==', true),
      orderBy('creadoEn', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
    
  } catch (error) {
    console.error('Error getting active products:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener un producto por ID
 */
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Producto no encontrado');
    }
    
  } catch (error) {
    console.error('Error getting product:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (productData) => {
  try {
    const newProduct = {
      ...productData,
      activo: true,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), newProduct);
    
    console.log('✅ Producto creado con ID:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Actualizar producto existente
 */
export const updateProduct = async (productId, productData) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    
    await updateDoc(productRef, {
      ...productData,
      actualizadoEn: serverTimestamp()
    });
    
    console.log('✅ Producto actualizado:', productId);
    return true;
    
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Eliminar producto
 */
export const deleteProduct = async (productId, imageURL = null) => {
  try {
    // Eliminar imagen de Storage si existe
    if (imageURL) {
      try {
        await deleteProductImage(imageURL);
      } catch (imgError) {
        console.warn('No se pudo eliminar la imagen:', imgError);
      }
    }
    
    // Eliminar documento de Firestore
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
    
    console.log('✅ Producto eliminado:', productId);
    return true;
    
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error(handleFirebaseError(error));
  }
};

// ==================== IMAGE OPERATIONS ====================

/**
 * Subir imagen de producto a Firebase Storage
 */
export const uploadProductImage = async (imageUri, productId = null) => {
  try {
    // Generar nombre único
    const timestamp = Date.now();
    const fileName = productId ? `${productId}_${timestamp}.jpg` : `${timestamp}.jpg`;
    const imagePath = `${STORAGE_PATHS.PRODUCTS}/${fileName}`;
    
    // Crear referencia en Storage
    const storageRef = ref(storage, imagePath);
    
    // Convertir URI a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Subir imagen
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Obtener URL pública
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Imagen subida:', downloadURL);
    return downloadURL;
    
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('No se pudo subir la imagen');
  }
};

/**
 * Eliminar imagen de producto de Firebase Storage
 */
export const deleteProductImage = async (imageURL) => {
  try {
    // Extraer path de la URL
    const path = imageURL.split('/o/')[1]?.split('?')[0];
    if (!path) throw new Error('URL inválida');
    
    const decodedPath = decodeURIComponent(path);
    const imageRef = ref(storage, decodedPath);
    
    await deleteObject(imageRef);
    
    console.log('✅ Imagen eliminada');
    return true;
    
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('No se pudo eliminar la imagen');
  }
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Listener en tiempo real de todos los productos (para admin)
 */
export const subscribeToProducts = (callback, onError = null) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      orderBy('creadoEn', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        callback(products);
      },
      (error) => {
        console.error('Error in products listener:', error);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error subscribing to products:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Listener en tiempo real de productos activos (para app móvil)
 */
export const subscribeToActiveProducts = (callback, onError = null) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('activo', '==', true),
      orderBy('creadoEn', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`🔄 Productos actualizados: ${products.length}`);
        callback(products);
      },
      (error) => {
        console.error('Error in active products listener:', error);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error subscribing to active products:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Listener de un producto específico
 */
export const subscribeToProduct = (productId, callback, onError = null) => {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in product listener:', error);
        if (onError) onError(error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('Error subscribing to product:', error);
    throw new Error(handleFirebaseError(error));
  }
};

// ==================== QUERY HELPERS ====================

/**
 * Buscar productos por categoría
 */
export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('categoria', '==', category),
      where('activo', '==', true),
      orderBy('creadoEn', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
    
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener productos con descuento (Happy Hour)
 */
export const getDiscountedProducts = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('descuento', '>', 0),
      where('activo', '==', true),
      orderBy('descuento', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
    
  } catch (error) {
    console.error('Error getting discounted products:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Obtener productos destacados (rating alto)
 */
export const getFeaturedProducts = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('activo', '==', true),
      where('rating', '>=', 4.5),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
    
  } catch (error) {
    console.error('Error getting featured products:', error);
    throw new Error(handleFirebaseError(error));
  }
};

/**
 * Actualizar stock de producto
 */
export const updateProductStock = async (productId, newStock) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    
    await updateDoc(productRef, {
      stock: newStock,
      actualizadoEn: serverTimestamp()
    });
    
    console.log('✅ Stock actualizado:', productId, newStock);
    return true;
    
  } catch (error) {
    console.error('Error updating stock:', error);
    throw new Error(handleFirebaseError(error));
  }
};

export default {
  getAllProducts,
  getActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  subscribeToProducts,
  subscribeToActiveProducts,
  subscribeToProduct,
  getProductsByCategory,
  getDiscountedProducts,
  getFeaturedProducts,
  updateProductStock
};
