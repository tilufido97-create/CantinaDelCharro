import { useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { sendOrderStatusNotification } from '../services/orderNotificationService';

export const useOrderStatusNotifications = (orderId) => {
  const previousStatusRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    const orderRef = ref(database, `orders/${orderId}`);
    
    const unsubscribe = onValue(orderRef, (snapshot) => {
      const order = snapshot.val();
      if (!order) return;

      const currentStatus = order.status;
      const previousStatus = previousStatusRef.current;

      // Solo enviar notificación si el estado cambió
      if (previousStatus && previousStatus !== currentStatus) {
        console.log(`📱 Estado cambió de ${previousStatus} a ${currentStatus}`);
        
        // Enviar notificación según el nuevo estado
        if (['preparando', 'listo_pickup', 'listo_delivery', 'en_camino', 'entregado'].includes(currentStatus)) {
          sendOrderStatusNotification(currentStatus, order);
        }
      }

      previousStatusRef.current = currentStatus;
    });

    return () => unsubscribe();
  }, [orderId]);
};

export default useOrderStatusNotifications;
