// ═══════════════════════════════════════════════════════════════
// qulayUy — API connector (Node.js + MongoDB backend)
// ═══════════════════════════════════════════════════════════════

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── Token boshqaruvi ────────────────────────────────────────
export const getToken = ()  => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const removeToken = ()=> localStorage.removeItem('token');

// ─── Asosiy request funksiyasi ───────────────────────────────
const request = async (path, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Xato: ${res.status}`);
  }
  return data;
};

// ─── Multipart (rasm yuklash uchun) ──────────────────────────
const requestMultipart = async (path, formData, method = 'POST') => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { method, headers, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Xato: ${res.status}`);
  return data;
};

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════
export const authApi = {
  // Kirish
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  // Ro'yxatdan o'tish
  register: async (name, email, password) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  // Chiqish
  logout: () => removeToken(),

  // Joriy foydalanuvchi
  getMe: () => request('/auth/me'),

  // Profilni yangilash
  updateProfile: (updates) => request('/auth/update', {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  // Hisobni o'chirish
  deleteAccount: () => request('/auth/delete', { method: 'DELETE' }),

  // Admin: barcha userlar
  getAllUsers: () => request('/auth/users'),

  // Admin: userni bloklash
  blockUser: (id) => request(`/auth/users/${id}/block`, { method: 'PUT' }),
};

// ═══════════════════════════════════════════════════════════════
// LISTINGS
// ═══════════════════════════════════════════════════════════════
export const listingApi = {
  // Barcha e'lonlar (filter + pagination)
  getAll: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    return request(`/listings?${query}`);
  },

  // Bitta e'lon
  getOne: (id) => request(`/listings/${id}`),

  // Yangi e'lon yaratish (admin, rasm bilan)
  create: (formData) => requestMultipart('/listings', formData),

  // E'lonni yangilash (admin)
  update: (id, formData) => requestMultipart(`/listings/${id}`, formData, 'PUT'),

  // E'lonni o'chirish (admin)
  delete: (id) => request(`/listings/${id}`, { method: 'DELETE' }),

  // Sevimliga qo'shish/olib tashlash
  toggleFavorite: (id) => request(`/listings/${id}/favorite`, { method: 'POST' }),

  // Sevimlillar ro'yxati
  getFavorites: () => request('/listings/user/favorites'),

  // Murojaat yuborish
  addInquiry: (id) => request(`/listings/${id}/inquiry`, { method: 'POST' }),
};

// ═══════════════════════════════════════════════════════════════
// MARKET
// ═══════════════════════════════════════════════════════════════
export const marketApi = {
  // Bozor ma'lumotlari
  getMarket: () => request('/market'),

  // Narx baholash (AI valuation)
  getValuation: (data) => request('/market/valuation', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
export const notificationApi = {
  getAll:      () => request('/notifications'),
  markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  markOneRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
};

// ═══════════════════════════════════════════════════════════════
// MOCK FALLBACK — Backend yo'q bo'lsa ham ishlaydi
// ═══════════════════════════════════════════════════════════════
const mockListings = [
  { id:1, title:'Premium Apartment in Mirabad', district:'Mirabad', city:'Tashkent', price:145000, estimatedValue:158000, pricePerM2:1708, rooms:3, size:85, floor:5, totalFloors:12, status:'underpriced', badge:'-8.4% Underpriced', images:['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop'], address:'Mirabad Avenue, 14A, Tashkent', views:342, favorites:28, inquiries:12, description:'Stunning 3-bedroom apartment with panoramic city views.', amenities:['Air Conditioning','Parking','Security','Balcony','High-speed WiFi'], agent:{name:'Alisher Karimov',title:'Senior Agent',rating:4.9,reviews:87} },
  { id:2, title:'City Tower Suite', district:'Yunusabad', city:'Tashkent', price:210000, estimatedValue:195000, pricePerM2:1615, rooms:2, size:130, floor:14, totalFloors:18, status:'overpriced', badge:'+7.2% Overpriced', images:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop'], address:'Tashkent City Tower, Block B', views:567, favorites:41, inquiries:19, description:'Luxury suite in Tashkent City.', amenities:['Smart Home','Concierge','Pool','Gym'], agent:{name:'Nilufar Rashidova',title:'Luxury Specialist',rating:4.8,reviews:64} },
  { id:3, title:'Classic Flat in Chilanzar', district:'Chilanzar', city:'Tashkent', price:89000, estimatedValue:91000, pricePerM2:1247, rooms:2, size:72, floor:3, totalFloors:9, status:'fair', badge:'Fair Value', images:['https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=600&auto=format&fit=crop'], address:'Chilanzar District', views:189, favorites:14, inquiries:6, description:'Well-maintained 2-bedroom flat.', amenities:['Balcony','Storage Room'], agent:{name:'Bobur Toshmatov',title:'Residential Agent',rating:4.6,reviews:43} },
];

const mockMarket = [
  { city:'TASHKENT', pricePerM2:'$1,240/m²', change:'+4.2%', trend:'up', note:'Mirabaddagi yuqori talab narxlarni oshirmoqda.' },
  { city:'SAMARKAND', pricePerM2:'$890/m²', change:'+2.8%', trend:'up', note:"Turizm o'sishi ijara daromadlarini oshirmoqda." },
  { city:'BUKHARA', pricePerM2:'$720/m²', change:'+1.5%', trend:'up', note:"Tourist growth sparking residential rental yields." },
];

// ─── Unified API (backend bo'lmasa mock qaytaradi) ────────────
export const api = {
  // E'lonlar
  getListings: async (params = {}) => {
    try {
      return await listingApi.getAll(params);
    } catch {
      let result = [...mockListings];
      if (params.district) result = result.filter(l => l.district.toLowerCase().includes(params.district.toLowerCase()));
      if (params.rooms) result = result.filter(l => l.rooms === parseInt(params.rooms));
      if (params.minPrice) result = result.filter(l => l.price >= parseInt(params.minPrice));
      if (params.maxPrice) result = result.filter(l => l.price <= parseInt(params.maxPrice));
      if (params.sort === 'price_asc') result.sort((a, b) => a.price - b.price);
      if (params.sort === 'price_desc') result.sort((a, b) => b.price - a.price);
      return { total: result.length, listings: result };
    }
  },

  getListing: async (id) => {
    try {
      const data = await listingApi.getOne(id);
      return data.listing || data;
    } catch {
      return mockListings.find(l => l.id === parseInt(id)) || null;
    }
  },

  getMarket: async () => {
    try {
      const data = await marketApi.getMarket();
      return data.regions || data;
    } catch {
      return mockMarket;
    }
  },

  getValuation: async (formData) => {
    try {
      return await marketApi.getValuation(formData);
    } catch {
      const est = Math.round((formData.price || 100000) * (0.9 + Math.random() * 0.2));
      const diff = (((est - formData.price) / formData.price) * 100).toFixed(1);
      return {
        currentPrice: formData.price,
        estimatedValue: est,
        priceDiff: diff,
        status: diff > 5 ? 'underpriced' : diff < -5 ? 'overpriced' : 'fair',
        factors: ['Tuman o\'rtacha narx', 'Qavat omili', 'Holat omili'],
      };
    }
  },

  login: async (email, password) => {
    try {
      return await authApi.login(email, password);
    } catch {
      // Mock login
      if (email === 'admin@gmail.com' && password === 'admin123') {
        return { token: 'mock-admin-token', user: { id: 'admin', name: 'Administrator', email, role: 'admin', credits: 999 } };
      }
      throw new Error("Email yoki parol noto'g'ri");
    }
  },
};

export { mockListings };
export default api;
