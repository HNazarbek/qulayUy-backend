# qulayUy Backend — Node.js + MongoDB

## 📁 Loyiha tuzilishi

```
uynarx-backend/
├── src/
│   ├── config/
│   │   └── db.js              ← MongoDB ulanish
│   ├── controllers/
│   │   ├── authController.js  ← Auth logikasi
│   │   ├── listingController.js ← E'lonlar + Valuation + Market
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js            ← JWT protect/adminOnly
│   │   ├── upload.js          ← Multer (rasm yuklash)
│   │   └── errorHandler.js    ← Global xato ushlagich
│   ├── models/
│   │   ├── User.js            ← Foydalanuvchi modeli
│   │   ├── Listing.js         ← E'lon modeli
│   │   └── Notification.js    ← Bildirishnoma modeli
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   ├── market.js
│   │   └── notifications.js
│   ├── data/
│   │   └── api.js             ← Frontend uchun API connector (ko'chirish kerak)
│   ├── server.js              ← Asosiy server
│   └── seed.js                ← Boshlang'ich ma'lumotlar
├── uploads/                   ← Yuklangan rasmlar (avtomatik yaratiladi)
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 O'rnatish

### 1. MongoDB o'rnatish

**Local:**
```bash
# macOS
brew install mongodb-community && brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb && sudo systemctl start mongodb

# yoki MongoDB Atlas (cloud) ishlatish mumkin
```

### 2. Paketlarni o'rnatish

```bash
cd uynarx-backend
npm install
```

### 3. .env fayl yaratish

```bash
cp .env.example .env
```

`.env` faylini tahrirlang:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/uynarx
JWT_SECRET=o_zingizning_maxfiy_kalitingiz_2025
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrator
```

### 4. Boshlang'ich ma'lumotlarni yuklash

```bash
npm run seed
```

Bu quyidagilarni yaratadi:
- 👑 Admin: `admin@gmail.com` / `admin123`
- 👤 Demo: `demo@uynarx.ai` / `demo1234`
- 🏠 18 ta e'lon

### 5. Serverni ishga tushirish

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

Server: `http://localhost:4000`

---

## 🔗 API Endpointlar

### Auth
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish |
| GET  | `/api/auth/me` | Joriy foydalanuvchi |
| PUT  | `/api/auth/update` | Profilni yangilash |
| DELETE | `/api/auth/delete` | Hisobni o'chirish |
| GET  | `/api/auth/users` | Barcha userlar (admin) |
| PUT  | `/api/auth/users/:id/block` | Bloklash (admin) |

### E'lonlar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET  | `/api/listings` | Barcha e'lonlar (filter + pagination) |
| GET  | `/api/listings/:id` | Bitta e'lon |
| POST | `/api/listings` | Yangi e'lon (admin) |
| PUT  | `/api/listings/:id` | Yangilash (admin) |
| DELETE | `/api/listings/:id` | O'chirish (admin) |
| POST | `/api/listings/:id/favorite` | Sevimliga qo'shish |
| GET  | `/api/listings/user/favorites` | Sevimlillar |
| POST | `/api/listings/:id/inquiry` | Murojaat |

### Market
| Method | URL | Tavsif |
|--------|-----|--------|
| GET  | `/api/market` | Bozor ma'lumotlari |
| POST | `/api/market/valuation` | Narx baholash (AI) |

### Notificationlar
| Method | URL | Tavsif |
|--------|-----|--------|
| GET  | `/api/notifications` | Barcha bildirishnomalar |
| PUT  | `/api/notifications/read-all` | Barchasini o'qilgan |
| PUT  | `/api/notifications/:id/read` | Bittasini o'qilgan |

---

## 🔍 Filter parametrlar

```
GET /api/listings?city=Tashkent&district=Mirabad&rooms=3&minPrice=50000&maxPrice=200000&status=underpriced&sort=price_asc&page=1&limit=9
```

**Sort:** `price_asc` | `price_desc` | `views_desc` | `newest`

---

## 📤 Rasm yuklash

E'lon yaratishda `multipart/form-data` ishlating:

```javascript
const formData = new FormData();
formData.append('title', 'Yangi e\'lon');
formData.append('price', '85000');
formData.append('images', file1);
formData.append('images', file2);

fetch('/api/listings', { method: 'POST', body: formData });
```

---

## 🔗 Frontend bilan ulash

`src/data/api.js` faylini frontend loyihangizga ko'chiring.

`vite.config.js` yoki `.env` da:
```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🛠️ Texnologiyalar

- **Node.js** + **Express** — Server
- **MongoDB** + **Mongoose** — Database
- **JWT** — Autentifikatsiya
- **bcryptjs** — Parol hashlash
- **Multer** — Rasm yuklash
