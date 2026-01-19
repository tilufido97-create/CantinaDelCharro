// Avatares de calaveras disponibles
export const AVATARS = [
  { id: '1', emoji: '💀', name: 'Calavera Clásica', color: '#FFFFFF' },
  { id: '2', emoji: '🤠', name: 'Charro Dorado', color: '#FFB800' },
  { id: '3', emoji: '😎', name: 'Calavera Cool', color: '#E5E5EA' },
  { id: '4', emoji: '🎩', name: 'Calavera Elegante', color: '#8E8E93' },
  { id: '5', emoji: '🎭', name: 'Calavera Festiva', color: '#FF9500' },
  { id: '6', emoji: '👑', name: 'Calavera Real', color: '#FFB800' },
  { id: '7', emoji: '🔥', name: 'Calavera Ardiente', color: '#FF3B30' },
  { id: '8', emoji: '⚡', name: 'Calavera Eléctrica', color: '#007AFF' },
];

// Categorías
export const CATEGORIES = [
  { id: 'cervezas', name: 'Cervezas', icon: '🍺', color: '#FFB800' },
  { id: 'vinos', name: 'Vinos', icon: '🍷', color: '#FF3B30' },
  { id: 'whisky', name: 'Whisky', icon: '🥃', color: '#FF9500' },
  { id: 'snacks', name: 'Snacks', icon: '🍿', color: '#34C759' },
  { id: 'ron', name: 'Ron', icon: '🍹', color: '#8E8E93' },
  { id: 'vodka', name: 'Vodka', icon: '🍸', color: '#007AFF' },
];

// Productos completos
export const PRODUCTS = [
  {
    id: 'p1',
    name: 'Cerveza Paceña Pilsener',
    description: 'La cerveza boliviana por excelencia. Sabor suave y refrescante.',
    price: 8.50,
    originalPrice: null,
    category: 'cervezas',
    brand: 'CBN',
    image: '🍺',
    stock: 50,
    volume: '355ml',
    alcoholPercentage: 4.8,
    rating: 4.7,
    reviews: 523,
    featured: true,
    isNew: false,
    discount: null,
    tags: ['popular', 'boliviana'],
  },
  {
    id: 'p2',
    name: 'Cerveza Huari',
    description: 'Cerveza artesanal boliviana con carácter único.',
    price: 9.00,
    originalPrice: null,
    category: 'cervezas',
    brand: 'Huari',
    image: '🍺',
    stock: 35,
    volume: '355ml',
    alcoholPercentage: 5.0,
    rating: 4.5,
    reviews: 312,
    featured: false,
    isNew: false,
    discount: null,
    tags: ['artesanal', 'boliviana'],
  },
  {
    id: 'p3',
    name: 'Singani Casa Real',
    description: 'El destilado de uva más fino de Bolivia.',
    price: 85.00,
    originalPrice: 95.00,
    category: 'ron',
    brand: 'Casa Real',
    image: '🥃',
    stock: 20,
    volume: '750ml',
    alcoholPercentage: 40.0,
    rating: 4.9,
    reviews: 189,
    featured: true,
    isNew: false,
    discount: 10,
    tags: ['premium', 'singani', 'boliviano'],
  },
  {
    id: 'p4',
    name: 'Vino Campos de Solana Tinto',
    description: 'Vino tinto de altura, cosecha especial.',
    price: 65.00,
    originalPrice: null,
    category: 'vinos',
    brand: 'Campos de Solana',
    image: '🍷',
    stock: 25,
    volume: '750ml',
    alcoholPercentage: 13.5,
    rating: 4.6,
    reviews: 145,
    featured: false,
    isNew: false,
    discount: null,
    tags: ['boliviano', 'tinto'],
  },
  {
    id: 'p5',
    name: 'Whisky Johnnie Walker Red',
    description: 'Whisky escocés de calidad reconocida.',
    price: 180.00,
    originalPrice: 200.00,
    category: 'whisky',
    brand: 'Johnnie Walker',
    image: '🥃',
    stock: 15,
    volume: '750ml',
    alcoholPercentage: 40.0,
    rating: 4.8,
    reviews: 892,
    featured: true,
    isNew: false,
    discount: 10,
    tags: ['importado', 'premium'],
  },
  {
    id: 'p6',
    name: 'Papas Lays Clásicas',
    description: 'Papas fritas crujientes sabor original.',
    price: 8.00,
    originalPrice: null,
    category: 'snacks',
    brand: 'Lays',
    image: '🍟',
    stock: 100,
    volume: '150g',
    alcoholPercentage: 0,
    rating: 4.3,
    reviews: 234,
    featured: false,
    isNew: false,
    discount: null,
    tags: ['snack'],
  },
  {
    id: 'p7',
    name: 'Vodka Absolut',
    description: 'Vodka sueco premium, sabor puro.',
    price: 120.00,
    originalPrice: null,
    category: 'vodka',
    brand: 'Absolut',
    image: '🍸',
    stock: 18,
    volume: '750ml',
    alcoholPercentage: 40.0,
    rating: 4.7,
    reviews: 456,
    featured: false,
    isNew: true,
    discount: null,
    tags: ['importado', 'nuevo'],
  },
  {
    id: 'p8',
    name: 'Cerveza Taquiña',
    description: 'Cerveza cochabambina de tradición.',
    price: 8.00,
    originalPrice: null,
    category: 'cervezas',
    brand: 'Taquiña',
    image: '🍺',
    stock: 60,
    volume: '355ml',
    alcoholPercentage: 4.5,
    rating: 4.4,
    reviews: 287,
    featured: false,
    isNew: false,
    discount: null,
    tags: ['boliviana'],
  },
];

// Combos
export const COMBOS = [
  {
    id: 'c1',
    name: 'Fiesta Completa',
    description: '6 cervezas + snacks variados',
    price: 65.00,
    originalPrice: 80.00,
    savings: 15.00,
    image: '🎉',
    products: ['p1', 'p6'],
    badge: 'MÁS VENDIDO',
  },
  {
    id: 'c2',
    name: 'Noche Romántica',
    description: 'Vino tinto + copas',
    price: 70.00,
    originalPrice: 85.00,
    savings: 15.00,
    image: '🌹',
    products: ['p4'],
    badge: 'NUEVO',
  },
];

// Banners promocionales
export const BANNERS = [
  {
    id: 'b1',
    title: 'Happy Hour',
    subtitle: '2x1 en cervezas seleccionadas',
    image: '🍺',
    link: 'Catalog',
    backgroundColor: '#FFB800',
  },
  {
    id: 'b2',
    title: 'Nuevo: Singani Premium',
    subtitle: '10% de descuento',
    image: '🥃',
    link: 'ProductDetail',
    backgroundColor: '#FF9500',
  },
];

// Recetas bolivianas
export const RECIPES = [
  {
    id: 'chuflay',
    name: 'Chuflay Clásico',
    description: 'El trago más popular de Bolivia',
    difficulty: 'Fácil',
    prepTime: '2 min',
    servings: 1,
    image: '🍹',
    ingredients: [
      { item: 'Singani Casa Real', amount: '60ml', productId: 'p3' },
      { item: 'Ginger Ale', amount: '120ml', productId: null },
      { item: 'Hielo', amount: 'al gusto', productId: null },
      { item: 'Limón', amount: '1 rodaja', productId: null },
    ],
    steps: [
      'Llenar vaso con hielo',
      'Agregar 60ml de Singani',
      'Completar con Ginger Ale',
      'Decorar con rodaja de limón',
      'Revolver suavemente'
    ],
    tips: ['Usar Ginger Ale bien fría', 'No revolver demasiado'],
    category: 'Clásicos Bolivianos',
    tags: ['singani', 'fácil', 'refrescante'],
  },
];

// Mensajes de bienvenida del chat
export const WELCOME_MESSAGES = [
  '¡Hola! Soy Claude Charro, tu cantinero virtual 🤠',
  '¿Qué te gustaría tomar hoy?',
  'Puedo ayudarte a elegir la bebida perfecta 🍺',
];

// Sugerencias rápidas para el chat
export const QUICK_SUGGESTIONS = [
  'Recomiéndame algo',
  '¿Cuánto demora el delivery?',
  'Ver ofertas del día',
  'Explicar puntos',
];

// Zonas de La Paz (solo 5 habilitadas)
export const ALL_ZONES = [
  { id: 1, name: 'Sopocachi', enabled: true, minDistance: 0.5, maxDistance: 3.0 },
  { id: 2, name: 'Miraflores', enabled: true, minDistance: 1.5, maxDistance: 4.0 },
  { id: 3, name: 'Achumani', enabled: true, minDistance: 3.0, maxDistance: 6.0 },
  { id: 4, name: 'Calacoto', enabled: true, minDistance: 2.5, maxDistance: 5.0 },
  { id: 5, name: 'Obrajes', enabled: true, minDistance: 2.0, maxDistance: 4.5 },
  { id: 6, name: 'San Miguel', enabled: false, minDistance: 1.0, maxDistance: 3.5 },
  { id: 7, name: 'Zona Sur', enabled: false, minDistance: 4.0, maxDistance: 8.0 },
  { id: 8, name: 'Centro', enabled: false, minDistance: 1.5, maxDistance: 3.0 },
  { id: 9, name: 'Villa Fátima', enabled: false, minDistance: 3.0, maxDistance: 6.0 },
  { id: 10, name: 'El Alto', enabled: false, minDistance: 5.0, maxDistance: 10.0 },
  { id: 11, name: 'Irpavi', enabled: false, minDistance: 3.5, maxDistance: 6.5 },
  { id: 12, name: 'Cota Cota', enabled: false, minDistance: 3.0, maxDistance: 5.5 },
  { id: 13, name: 'San Pedro', enabled: false, minDistance: 1.0, maxDistance: 2.5 },
  { id: 14, name: 'Munaypata', enabled: false, minDistance: 2.0, maxDistance: 4.0 },
  { id: 15, name: 'Mallasa', enabled: false, minDistance: 6.0, maxDistance: 12.0 },
];

// Zonas habilitadas (para compatibilidad)
export const SUPPORTED_ZONES = ALL_ZONES.filter(z => z.enabled);

// Métodos de pago
export const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Efectivo contra entrega',
    icon: '💵',
    description: 'Paga al recibir tu pedido',
    enabled: true
  },
  {
    id: 'qr_tigo',
    name: 'Tigo Money (QR)',
    icon: '📱',
    description: 'Pago instantáneo con QR',
    enabled: true
  },
  {
    id: 'qr_bank',
    name: 'Transferencia QR Banco',
    icon: '🏦',
    description: 'BCP, BNB, Banco Sol, etc.',
    enabled: true
  }
];

// Datos de tienda
export const MOCK_REWARDS = [
  { id: 'reward1', title: '5% de descuento', description: 'En tu próxima compra', pointsCost: 200, icon: 'ticket-percent', category: 'discount', minLevel: 'bronze' },
  { id: 'reward2', title: '10% de descuento', description: 'En tu próxima compra', pointsCost: 500, icon: 'ticket-percent', category: 'discount', minLevel: 'silver' },
  { id: 'reward3', title: 'Envío gratis', description: 'En tu próximo pedido', pointsCost: 300, icon: 'truck-fast', category: 'delivery', minLevel: 'silver' },
  { id: 'reward4', title: 'Singani Rujero 750ml', description: 'Producto gratis', pointsCost: 1500, icon: 'bottle-tonic', category: 'product', minLevel: 'gold' },
  { id: 'reward5', title: '15% de descuento', description: 'En tu próxima compra', pointsCost: 1000, icon: 'ticket-percent', category: 'discount', minLevel: 'gold' },
  { id: 'reward6', title: 'Acceso VIP', description: 'Productos exclusivos por 1 mes', pointsCost: 2000, icon: 'crown', category: 'experience', minLevel: 'platinum' },
];

export const STORE_INFO = {
  name: 'La Cantina del Charro',
  address: 'Av. Arce #2140, Sopocachi',
  coordinates: {
    latitude: -16.5000,
    longitude: -68.1193
  },
  phone: '+591 2 2441234',
  whatsapp: '+591 70123456'
};

// Mock Orders
export const MOCK_ORDERS = [
  {
    id: 'order_001',
    orderNumber: 'CH-2026-001',
    status: 'delivered',
    createdAt: Date.now() - 86400000 * 2,
    deliveredAt: Date.now() - 86400000 * 2 + 3600000,
    items: [
      { productId: 'p3', name: 'Singani Casa Real 750ml', price: 85, quantity: 2, image: '🥃' },
      { productId: 'p1', name: 'Cerveza Paceña 355ml', price: 8.5, quantity: 6, image: '🍺' },
    ],
    subtotal: 221,
    delivery: 15,
    discount: 0,
    total: 236,
    paymentMethod: 'Tarjeta •••• 4242',
    deliveryAddress: {
      street: 'Av. 6 de Agosto #1234',
      zone: 'San Miguel',
      city: 'La Paz',
      reference: 'Edificio azul, piso 3',
    },
  },
  {
    id: 'order_002',
    orderNumber: 'CH-2026-002',
    status: 'delivered',
    createdAt: Date.now() - 86400000 * 5,
    deliveredAt: Date.now() - 86400000 * 5 + 3600000,
    items: [
      { productId: 'p5', name: 'Whisky Johnnie Walker Red 750ml', price: 180, quantity: 1, image: '🥃' },
    ],
    subtotal: 180,
    delivery: 0,
    discount: 18,
    total: 162,
    paymentMethod: 'Efectivo',
    deliveryAddress: {
      street: 'Calle Murillo #567',
      zone: 'Centro',
      city: 'La Paz',
      reference: 'Casa blanca con reja negra',
    },
  },
  {
    id: 'order_003',
    orderNumber: 'CH-2026-003',
    status: 'cancelled',
    createdAt: Date.now() - 86400000 * 10,
    cancelledAt: Date.now() - 86400000 * 10 + 600000,
    items: [
      { productId: 'p7', name: 'Vodka Absolut 750ml', price: 120, quantity: 1, image: '🍸' },
    ],
    subtotal: 120,
    delivery: 15,
    discount: 0,
    total: 135,
    paymentMethod: 'Tarjeta •••• 4242',
    deliveryAddress: {
      street: 'Av. Arce #890',
      zone: 'Sopocachi',
      city: 'La Paz',
      reference: 'Edificio Arce Tower',
    },
    cancellationReason: 'Cancelado por el usuario',
  },
];

// FAQ Data
export const FAQ_DATA = [
  { id: 'faq_1', category: 'Pedidos', question: '¿Cuál es el tiempo de entrega?', answer: 'El tiempo de entrega promedio es de 30-45 minutos. Para pedidos Express, garantizamos entrega en 20 minutos o menos.' },
  { id: 'faq_2', category: 'Pedidos', question: '¿Cuál es el monto mínimo de compra?', answer: 'El monto mínimo de compra es de Bs. 50. Para envío gratis, el pedido debe ser de al menos Bs. 200.' },
  { id: 'faq_3', category: 'Pedidos', question: '¿Puedo cancelar mi pedido?', answer: 'Sí, puedes cancelar tu pedido sin costo hasta que el repartidor confirme la recogida. Después de eso, aplican cargos de cancelación.' },
  { id: 'faq_4', category: 'Pagos', question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard), efectivo contra entrega, y transferencias bancarias.' },
  { id: 'faq_5', category: 'Pagos', question: '¿Es seguro pagar con tarjeta?', answer: 'Sí, todas las transacciones están encriptadas y protegidas. No almacenamos información completa de tu tarjeta.' },
  { id: 'faq_6', category: 'Cuenta', question: '¿Cómo cambio mi contraseña?', answer: 'Ve a Perfil > Configuración > Seguridad y selecciona "Cambiar contraseña".' },
  { id: 'faq_7', category: 'Cuenta', question: '¿Cómo elimino mi cuenta?', answer: 'Contacta a soporte@lacantinaelcharro.com para solicitar la eliminación de tu cuenta. El proceso toma 7 días hábiles.' },
  { id: 'faq_8', category: 'Recompensas', question: '¿Cómo gano puntos?', answer: 'Ganas 1 punto por cada Bs. gastado. También puedes ganar puntos jugando, refiriendo amigos, y con bonos especiales.' },
  { id: 'faq_9', category: 'Recompensas', question: '¿Los puntos expiran?', answer: 'Los puntos no expiran mientras tu cuenta esté activa. Si no realizas ninguna actividad por 12 meses, los puntos se resetean.' },
  { id: 'faq_10', category: 'Técnico', question: 'La app no carga, ¿qué hago?', answer: 'Intenta cerrar y abrir la app. Si el problema persiste, verifica tu conexión a internet o reinstala la aplicación.' },
];

// Legal
export const TERMS_OF_SERVICE = `TÉRMINOS Y CONDICIONES DE USO - LA CANTINA DEL CHARRO

Última actualización: Enero 2026

1. ACEPTACIÓN DE LOS TÉRMINOS
Al acceder y usar La Cantina del Charro, aceptas estar obligado por estos Términos y Condiciones de Uso.

2. EDAD MÍNIMA
Debes ser mayor de 18 años para usar este servicio. Al registrarte, confirmas que cumples con este requisito.

3. USO DEL SERVICIO
- Debes proporcionar información precisa y actualizada
- Eres responsable de mantener la confidencialidad de tu cuenta
- No puedes usar el servicio para fines ilegales
- Nos reservamos el derecho de suspender cuentas que violen estos términos

4. PEDIDOS Y PAGOS
- Todos los precios están en Bolivianos (Bs.)
- Los precios pueden cambiar sin previo aviso
- Nos reservamos el derecho de cancelar pedidos en casos excepcionales
- Los pagos son procesados de forma segura

5. ENTREGA
- Los tiempos de entrega son estimados
- No somos responsables por retrasos causados por factores externos
- Debes estar disponible para recibir tu pedido

6. POLÍTICA DE DEVOLUCIONES
- No aceptamos devoluciones de productos por la naturaleza del negocio
- Si recibes un producto defectuoso, contáctanos en 24 horas

7. LIMITACIÓN DE RESPONSABILIDAD
La Cantina del Charro no será responsable por daños indirectos, incidentales o consecuentes.

8. MODIFICACIONES
Nos reservamos el derecho de modificar estos términos en cualquier momento.

9. CONTACTO
Para preguntas sobre estos términos: soporte@lacantinaelcharro.com`;

export const PRIVACY_POLICY = `POLÍTICA DE PRIVACIDAD - LA CANTINA DEL CHARRO

Última actualización: Enero 2026

1. INFORMACIÓN QUE RECOPILAMOS
- Información personal: nombre, teléfono, dirección
- Información de pago (procesada de forma segura)
- Historial de pedidos
- Ubicación (solo con tu permiso)
- Datos de uso de la aplicación

2. CÓMO USAMOS TU INFORMACIÓN
- Procesar y entregar tus pedidos
- Mejorar nuestro servicio
- Enviarte notificaciones sobre tu pedido
- Marketing (solo con tu consentimiento)
- Cumplir con requisitos legales

3. COMPARTIR INFORMACIÓN
No vendemos tu información personal. Solo compartimos datos con:
- Repartidores (solo lo necesario para la entrega)
- Procesadores de pago
- Autoridades (si es requerido legalmente)

4. SEGURIDAD
Implementamos medidas de seguridad para proteger tu información, incluyendo encriptación y almacenamiento seguro.

5. TUS DERECHOS
Tienes derecho a:
- Acceder a tu información
- Corregir datos incorrectos
- Solicitar eliminación de tu cuenta
- Optar por no recibir comunicaciones de marketing

6. COOKIES Y TECNOLOGÍAS SIMILARES
Usamos cookies para mejorar tu experiencia. Puedes deshabilitarlas en la configuración de la app.

7. CAMBIOS A ESTA POLÍTICA
Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos.

8. CONTACTO
Para preguntas sobre privacidad: privacidad@lacantinaelcharro.com`;

// Mock Avatars
export const MOCK_AVATARS = [
  { id: 'avatar1', name: 'Calavera Clásica', emoji: '💀' },
  { id: 'avatar2', name: 'Charro Dorado', emoji: '🤠' },
  { id: 'avatar3', name: 'Calavera Cool', emoji: '😎' },
  { id: 'avatar4', name: 'Calavera Elegante', emoji: '🎩' },
];

// Mock Products para Admin Panel
export const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Singani Casa Real 750ml',
    category: 'Singani',
    price: 85.00,
    discount: 10,
    stock: 50,
    description: 'El destilado de uva más fino de Bolivia. Ideal para chuflay.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 15).toISOString()
  },
  {
    id: 'prod-2',
    name: 'Cerveza Paceña Six Pack',
    category: 'Cerveza',
    price: 45.00,
    discount: 0,
    stock: 120,
    description: 'Pack de 6 cervezas Paceña 355ml. La cerveza boliviana por excelencia.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 10).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Ron Havana Club 7 Años',
    category: 'Ron',
    price: 120.00,
    discount: 0,
    stock: 0,
    description: 'Ron cubano añejado 7 años. Sabor suave y complejo.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 12).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Whisky Johnnie Walker Red Label',
    category: 'Whisky',
    price: 180.00,
    discount: 15,
    stock: 35,
    description: 'Whisky escocés mezclado. Sabor intenso y equilibrado.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 14).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Vodka Absolut 750ml',
    category: 'Vodka',
    price: 95.00,
    discount: 0,
    stock: 28,
    description: 'Vodka sueco premium. Puro y suave.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 11).toISOString()
  },
  {
    id: 'prod-6',
    name: 'Vino Campos de Solana Tinto',
    category: 'Vino',
    price: 65.00,
    discount: 0,
    stock: 42,
    description: 'Vino tinto boliviano de altura. Cosecha 2024.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 13).toISOString()
  },
  {
    id: 'prod-7',
    name: 'Cerveza Huari Artesanal',
    category: 'Cerveza',
    price: 12.00,
    discount: 0,
    stock: 8,
    description: 'Cerveza artesanal boliviana. Sabor único y auténtico.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 16).toISOString()
  },
  {
    id: 'prod-8',
    name: 'Papas Lays Clásicas 150g',
    category: 'Snacks',
    price: 8.00,
    discount: 0,
    stock: 200,
    description: 'Papas fritas crujientes sabor original.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 9).toISOString()
  },
  {
    id: 'prod-9',
    name: 'Licor Amaretto Disaronno',
    category: 'Licores',
    price: 110.00,
    discount: 20,
    stock: 15,
    description: 'Licor italiano de almendra. Dulce y aromático.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 15).toISOString()
  },
  {
    id: 'prod-10',
    name: 'Cerveza Taquiña 355ml',
    category: 'Cerveza',
    price: 8.00,
    discount: 0,
    stock: 95,
    description: 'Cerveza cochabambina de tradición.',
    images: ['https://via.placeholder.com/300'],
    createdAt: new Date(2026, 0, 1).toISOString(),
    updatedAt: new Date(2026, 0, 8).toISOString()
  }
];
