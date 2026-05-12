require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Listing  = require('./models/Listing');
const Notification = require('./models/Notification');

const connectDB = require('./config/db');

// ─── Ma'lumotlar ─────────────────────────────────────────────
const LISTINGS_DATA = [
  { title:'Premium Apartment in Mirabad', district:'Mirabad', city:'Tashkent', price:145000, rooms:3, size:85, floor:5, totalFloors:12, address:'Mirabad Avenue, 14A, Tashkent', images:['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop'], amenities:['Air Conditioning','Parking','Security','Balcony','High-speed WiFi'], description:'Stunning 3-bedroom apartment with panoramic city views. European renovation, designer furniture included.', views:342, favorites:28, inquiries:12 },
  { title:'City Tower Suite', district:'Yunusabad', city:'Tashkent', price:210000, rooms:2, size:130, floor:14, totalFloors:18, address:'Tashkent City Tower, Block B', images:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop'], amenities:['Smart Home','Concierge','Pool','Gym','Valet Parking'], description:'Luxury suite in Tashkent City. Breathtaking skyline views.', views:567, favorites:41, inquiries:19 },
  { title:'Classic Flat in Chilanzar', district:'Chilanzar', city:'Tashkent', price:89000, rooms:2, size:72, floor:3, totalFloors:9, address:'Chilanzar District, Str. 3, Building 12', images:['https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=600&auto=format&fit=crop'], amenities:['Balcony','Storage Room','Intercom'], description:'Well-maintained 2-bedroom flat in established residential area.', views:189, favorites:14, inquiries:6 },
  { title:'Modern Studio in Mirzo Ulugbek', district:'Mirzo Ulugbek', city:'Tashkent', price:65000, rooms:1, size:45, floor:7, totalFloors:16, address:'Mirzo Ulugbek District, New Building Complex', images:['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&auto=format&fit=crop'], amenities:['Air Conditioning','High-speed WiFi','Balcony'], description:'Compact modern studio perfect for young professionals.', views:224, favorites:31, inquiries:9 },
  { title:'Family Villa in Yunusabad', district:'Yunusabad', city:'Tashkent', price:380000, rooms:5, size:250, floor:1, totalFloors:3, address:'Yunusabad, Premium Quarter', images:['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop'], amenities:['Pool','Garden','Garage','Security','Smart Home'], description:'Spacious family villa with private garden and swimming pool.', views:412, favorites:55, inquiries:22 },
  { title:'Budget Apartment in Sergeli', district:'Sergeli', city:'Tashkent', price:42000, rooms:2, size:50, floor:2, totalFloors:5, address:'Sergeli District, Block 14', images:['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop'], amenities:['Balcony','Storage'], description:'Affordable 2-room apartment, recently repaired.', views:98, favorites:8, inquiries:3 },
  { title:'Penthouse in Yakkasaray', district:'Yakkasaray', city:'Tashkent', price:320000, rooms:4, size:150, floor:17, totalFloors:17, address:'Yakkasaray, Central Tower', images:['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop'], amenities:['Terrace','Smart Home','Pool','Concierge','Gym'], description:'Top floor penthouse with 360° panoramic views of Tashkent.', views:287, favorites:33, inquiries:15 },
  { title:'Renovated 3-Room in Almazar', district:'Almazar', city:'Tashkent', price:98000, rooms:3, size:80, floor:4, totalFloors:10, address:'Almazar District, Dustlik Street', images:['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop'], amenities:['Air Conditioning','Balcony','Parking'], description:'Fully renovated 3-bedroom apartment with modern finishes.', views:156, favorites:19, inquiries:7 },
  { title:'Studio Near Compass', district:'Mirabad', city:'Tashkent', price:75000, rooms:1, size:45, floor:8, totalFloors:14, address:'Mirabad, Compass Shopping Center Area', images:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop'], amenities:['High-speed WiFi','Security','Air Conditioning'], description:'Modern studio in prime location near Compass shopping mall.', views:201, favorites:22, inquiries:8 },
  { title:'Luxury 4-Room in Samarkand', district:'Markaz', city:'Samarkand', price:185000, rooms:4, size:200, floor:3, totalFloors:8, address:'Samarkand, Registon yonida', images:['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&auto=format&fit=crop'], amenities:['Garden View','Parking','Security','Balcony'], description:'Spacious luxury apartment near historical Registon square.', views:134, favorites:16, inquiries:5 },
  { title:'Cozy 2-Room in Bukhara', district:'Shahrisabz', city:'Bukhara', price:58000, rooms:2, size:70, floor:2, totalFloors:5, address:"Bukhara, Shahriston ko'chasi", images:['https://images.unsplash.com/photo-1615529179035-bd38e8fde8e0?w=600&auto=format&fit=crop'], amenities:['Historic View','Courtyard','Air Conditioning'], description:'Charming apartment in ancient Bukhara city center.', views:89, favorites:11, inquiries:4 },
  { title:'New Build in Namangan', district:'Eski shahar', city:'Namangan', price:72000, rooms:3, size:90, floor:5, totalFloors:9, address:'Namangan, Yangi mahalla', images:['https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&auto=format&fit=crop'], amenities:['New Building','Balcony','Parking','Air Conditioning'], description:'Brand new 3-room apartment in Namangan city.', views:112, favorites:9, inquiries:3 },
  { title:'Investment Flat in Fergana', district:'Markaz', city:'Fergana', price:82000, rooms:2, size:100, floor:3, totalFloors:7, address:'Fergana, Central Boulevard', images:['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop'], amenities:['Balcony','Security','High-speed WiFi'], description:'Great investment opportunity in Fergana city center.', views:145, favorites:17, inquiries:6 },
  { title:'Villa in Tashkent Hills', district:'Yunusabad', city:'Tashkent', price:550000, rooms:6, size:250, floor:1, totalFloors:2, address:'Yunusabad Hills, Private Road', images:['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&auto=format&fit=crop'], amenities:['Pool','Garden','Garage','Smart Home','Tennis Court','Cinema'], description:'Exclusive private villa in the prestigious hills area.', views:321, favorites:47, inquiries:18 },
  { title:'Premium Flat in Center-1', district:'Center-1', city:'Tashkent', price:195000, rooms:3, size:100, floor:9, totalFloors:12, address:'Center-1, Amir Temur Boulevard', images:['https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&auto=format&fit=crop'], amenities:['Smart Home','Concierge','Parking','Security','Gym'], description:'Premium 3-bedroom flat on Amir Temur Boulevard.', views:289, favorites:34, inquiries:14 },
  { title:'3-Room in Mirzo Ulugbek', district:'Mirzo Ulugbek', city:'Tashkent', price:115000, rooms:3, size:90, floor:6, totalFloors:12, address:'Mirzo Ulugbek, Science Street', images:['https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&auto=format&fit=crop'], amenities:['Balcony','Parking','Air Conditioning'], description:'Spacious 3-room apartment near science institutes.', views:167, favorites:21, inquiries:8 },
  { title:'Duplex in Yakkasaray', district:'Yakkasaray', city:'Tashkent', price:260000, rooms:4, size:150, floor:10, totalFloors:14, address:'Yakkasaray, Navoi Street', images:['https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600&auto=format&fit=crop'], amenities:['Terrace','Smart Home','Parking','Security'], description:'Two-level luxury duplex apartment with stunning city views.', views:198, favorites:26, inquiries:11 },
  { title:'Affordable Studio in Chilanzar', district:'Chilanzar', city:'Tashkent', price:38000, rooms:1, size:45, floor:1, totalFloors:5, address:"Chilanzar, Bog'cha Street", images:['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&auto=format&fit=crop'], amenities:['Balcony'], description:'Compact affordable studio, perfect for first-time buyers.', views:78, favorites:12, inquiries:4 },
];

const AGENTS = [
  { name: 'Alisher Karimov',  title: 'Senior Agent',      rating: 4.9, reviews: 87  },
  { name: 'Nilufar Rashidova',title: 'Luxury Specialist',  rating: 4.8, reviews: 64  },
  { name: 'Bobur Toshmatov',  title: 'Residential Agent',  rating: 4.6, reviews: 43  },
];

// ─── Seed ─────────────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();

    // Tozalash
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑  Eski ma\'lumotlar o\'chirildi');

    // Admin yaratish
    const admin = await User.create({
      name:     process.env.ADMIN_NAME     || 'Administrator',
      email:    process.env.ADMIN_EMAIL    || 'admin@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role:     'admin',
      credits:  999,
      phone:    '+998 99 000 00 00',
    });
    console.log(`✅ Admin yaratildi: ${admin.email}`);

    // Demo user
    const demoUser = await User.create({
      name:     'Demo User',
      email:    'demo@uynarx.ai',
      password: 'demo1234',
      role:     'user',
      credits:  50,
    });
    console.log(`✅ Demo user: ${demoUser.email}`);

    // E'lonlar
    const listings = [];
    for (let i = 0; i < LISTINGS_DATA.length; i++) {
      const d = LISTINGS_DATA[i];
      const agent = AGENTS[i % AGENTS.length];
      const listing = await Listing.create({
        ...d,
        agent,
        owner: admin._id,
        propertyType: d.rooms === 1 ? 'Studiya' : d.rooms >= 5 ? 'Villa' : 'Kvartira',
      });
      listings.push(listing);
    }
    console.log(`✅ ${listings.length} ta e'lon qo'shildi`);

    // Notificationlar
    await Notification.insertMany([
      { user: admin._id, type: 'welcome',     title: "Admin paneliga xush kelibsiz!", message: "Barcha e'lonlarni boshqaring." },
      { user: admin._id, type: 'insight',     title: "Mirabad narxlari +4.2% oshdi",  message: "So'nggi oyda sezilarli o'sish." },
      { user: admin._id, type: 'new_listing', title: "18 ta yangi e'lon qo'shildi",   listing: listings[0]._id },
      { user: demoUser._id, type: 'welcome',  title: "UyNarx'ga xush kelibsiz!",      message: "50 ta bepul kredit berildi." },
    ]);
    console.log('✅ Notificationlar qo\'shildi');

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Seed muvaffaqiyatli yakunlandi!');
    console.log('─────────────────────────────────────────');
    console.log(`👑 Admin:     admin@gmail.com / admin123`);
    console.log(`👤 Demo user: demo@uynarx.ai / demo1234`);
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed xatosi:', err);
    process.exit(1);
  }
};

seed();
