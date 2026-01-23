# 🔥 Firebase Database Schema - La Cantina del Charro

## 📊 Collections Structure

### 👥 users
```javascript
{
  id: "auto-generated",
  email: "user@example.com",
  name: "User Name",
  phone: "+1234567890",
  role: "customer" | "admin" | "delivery",
  isActive: true,
  profileImage: "url",
  dateOfBirth: "1990-01-01",
  loyaltyPoints: 0,
  totalOrders: 0,
  permissions: ["read", "write"], // for admin users
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 📦 products
```javascript
{
  id: "auto-generated",
  name: "Product Name",
  description: "Product description",
  price: 100.00,
  categoryId: "category_id",
  image: "product_image.jpg",
  images: ["img1.jpg", "img2.jpg"],
  stock: 50,
  isActive: true,
  alcoholContent: 40.0, // percentage
  volume: 750, // ml
  brand: "Brand Name",
  origin: "Mexico",
  tags: ["premium", "aged"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 📂 categories
```javascript
{
  id: "auto-generated",
  name: "Category Name",
  description: "Category description",
  icon: "🥃",
  image: "category_image.jpg",
  isActive: true,
  sortOrder: 1,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 🛒 orders
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  orderNumber: "ORD-2024-001",
  status: "pending" | "confirmed" | "preparing" | "on_way" | "delivered" | "cancelled",
  items: [
    {
      productId: "product_id",
      name: "Product Name",
      price: 100.00,
      quantity: 2,
      subtotal: 200.00
    }
  ],
  subtotal: 200.00,
  tax: 32.00,
  deliveryFee: 50.00,
  discount: 0.00,
  total: 282.00,
  paymentMethod: "card" | "cash" | "transfer",
  deliveryAddress: {
    street: "Street Address",
    city: "City",
    state: "State",
    zipCode: "12345",
    coordinates: { lat: 0.0, lng: 0.0 }
  },
  estimatedDeliveryTime: 30, // minutes
  driverId: "driver_id",
  notes: "Special instructions",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 📍 addresses
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  name: "Home" | "Work" | "Other",
  street: "Street Address",
  city: "City",
  state: "State",
  zipCode: "12345",
  coordinates: { lat: 0.0, lng: 0.0 },
  isDefault: false,
  createdAt: timestamp
}
```

### 💳 payment_methods
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  type: "card" | "paypal" | "bank_transfer",
  cardLast4: "1234", // for cards
  cardBrand: "visa" | "mastercard",
  expiryMonth: 12,
  expiryYear: 2025,
  isDefault: false,
  createdAt: timestamp
}
```

### 🎮 game_scores
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  userName: "Player Name",
  gameName: "Ruleta Rusa" | "Cultura Chupística" | "Mixology Master" | "Todis" | "Poker" | "Blackjack",
  score: 1500,
  gameData: {
    // Game-specific data
    rounds: 3,
    players: ["Player1", "Player2"],
    duration: 300 // seconds
  },
  createdAt: timestamp
}
```

### 🏆 loyalty_points
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  points: 100,
  action: "order_completed" | "game_won" | "referral" | "review" | "birthday",
  description: "Points earned from order #ORD-2024-001",
  orderId: "order_id", // optional
  createdAt: timestamp
}
```

### 🔔 notifications
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  title: "Notification Title",
  body: "Notification message",
  type: "order" | "promotion" | "game" | "system",
  data: { orderId: "order_id" }, // optional
  isRead: false,
  createdAt: timestamp
}
```

### 🎁 promotions
```javascript
{
  id: "auto-generated",
  title: "Happy Hour",
  description: "2x1 en cervezas seleccionadas",
  discountType: "percentage" | "fixed_amount",
  discountValue: 50,
  minOrderAmount: 200.00,
  maxDiscount: 100.00,
  startDate: timestamp,
  endDate: timestamp,
  startTime: "18:00",
  endTime: "20:00",
  validDays: ["monday", "tuesday", "wednesday"],
  applicableCategories: ["category_id1", "category_id2"],
  applicableProducts: ["product_id1", "product_id2"],
  usageLimit: 100,
  usageCount: 0,
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 🚚 delivery_drivers
```javascript
{
  id: "auto-generated",
  email: "driver@example.com",
  name: "Driver Name",
  phone: "+1234567890",
  vehicleType: "motorcycle" | "car" | "bicycle",
  vehiclePlate: "ABC-123",
  isActive: true,
  isOnline: false,
  currentLocation: { lat: 0.0, lng: 0.0 },
  rating: 4.8,
  totalDeliveries: 150,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### ⭐ reviews
```javascript
{
  id: "auto-generated",
  userId: "user_id",
  orderId: "order_id",
  rating: 5, // 1-5 stars
  comment: "Great service!",
  reviewType: "order" | "delivery" | "product",
  productId: "product_id", // if product review
  driverId: "driver_id", // if delivery review
  createdAt: timestamp
}
```

## 🔐 Admin Users (Seeded)

### Default Admin Accounts:
- **pintocalvettyadrianchristian@gmail.com** - Adrian Christian Pinto Calvetti
- **tilufido97@gmail.com** - Admin User 2

Both accounts have:
- Role: `admin`
- Permissions: `["all"]`
- Active status: `true`

## 🌱 Seeded Data

### Categories:
- 🥃 Tequilas
- 🍺 Cervezas  
- 🍶 Mezcales
- 🥃 Whiskeys
- 🍸 Vodkas
- 🍹 Rones
- 🥨 Botanas
- 🥤 Mixers

### Sample Products:
- Tequila Don Julio 1942 ($2,500)
- Corona Extra ($45)
- Mezcal Montelobos ($800)

### Game Templates:
- Ruleta Rusa (2-8 players)
- Cultura Chupística (2-8 players)
- Mixology Master (2-8 players)
- Todis (2-8 players)
- Poker (2-6 players)
- Blackjack (1-4 players)

### Promotions:
- Happy Hour (2x1 cervezas 18:00-20:00)
- Fin de Semana Tequilero (20% descuento)

## 🚀 Usage

The database will be automatically seeded when the app starts for the first time. The seeder checks if data already exists to avoid duplicates.

```javascript
import { useFirebaseInit } from '../hooks/useFirebaseInit';

// In your component
const { isInitialized, isLoading, error } = useFirebaseInit();
```