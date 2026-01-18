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
