const { default: mongoose } = require('mongoose');
const Listing      = require('../models/Listing');
const Notification = require('../models/Notification');

// ─── GET /api/listings ───────────────────────────────────────
exports.getListings = async (req, res, next) => {
  try {
    const {
      city, district, rooms, minPrice, maxPrice,
      status, sort = 'createdAt_desc',
      page = 1, limit = 9,
      search,
    } = req.query;

    const filter = { isPublished: true, isDeleted: false };

    if (city)     filter.city     = new RegExp(city, 'i');
    if (district) filter.district = new RegExp(district, 'i');
    if (status)   filter.status   = status;
    if (rooms && rooms !== 'null') {
      const r = parseInt(rooms);
      if (!isNaN(r)) filter.rooms = r;
      else filter.rooms = rooms; // 'Studio', '5+'
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title:    new RegExp(search, 'i') },
        { district: new RegExp(search, 'i') },
        { city:     new RegExp(search, 'i') },
        { address:  new RegExp(search, 'i') },
      ];
    }

    // Saralash
    const sortMap = {
      price_asc:    { price: 1 },
      price_desc:   { price: -1 },
      views_desc:   { views: -1 },
      newest:       { createdAt: -1 },
      createdAt_desc: { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip  = (parseInt(page) - 1) * parseInt(limit);


        console.log('DB name:', mongoose.connection.db.databaseName);
    console.log('Collection:', Listing.collection.collectionName);
    const total = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'name email');

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      listings,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/listings/:id ───────────────────────────────────
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      isPublished: true,
      isDeleted: false,
    }).populate({ path: 'owner', select: 'name email', strictPopulate: false })

    if (!listing) {
      return res.status(404).json({ success: false, message: "E'lon topilmadi" });
    }

    // Ko'rishlar soni +1
    listing.views += 1;
    await listing.save({ validateBeforeSave: false });

    res.json({ success: true, listing });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/listings — Admin ──────────────────────────────
exports.createListing = async (req, res, next) => {
  try {
    const {
      title, district, city, address, price,
      rooms, size, livingArea, floor, totalFloors,
      propertyType, amenities, description,
      listingType, monthlyRent, deposit, negotiable,
      lat, lng,
    } = req.body;

    // Yuklangan rasmlar
    const images = req.files?.map(f => `/uploads/${f.filename}`) || [];

    const listing = await Listing.create({
      title, district, city, address, price: parseInt(price),
      rooms: parseInt(rooms) || rooms,
      size: parseInt(size),
      livingArea: livingArea ? parseInt(livingArea) : null,
      floor: parseInt(floor),
      totalFloors: parseInt(totalFloors),
      propertyType, amenities: Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []),
      description,
      listingType: listingType || 'sale',
      monthlyRent: monthlyRent ? parseInt(monthlyRent) : null,
      deposit:     deposit     ? parseInt(deposit)     : null,
      negotiable:  negotiable === 'true' || negotiable === true,
      images,
      owner: req.user._id,
      agent: {
        name:    req.user.name,
        title:   req.user.role === 'admin' ? 'Admin' : 'Agent',
        rating:  5.0,
        reviews: 0,
      },
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng) || 69.2401, parseFloat(lat) || 41.2995],
      },
    });

    // Notification: barcha userlarga yangi e'lon
    // (real loyihada WebSocket ishlatiladi)

    res.status(201).json({ success: true, listing });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/listings/:id — Admin ───────────────────────────
exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, isDeleted: false });
    if (!listing) return res.status(404).json({ success: false, message: "E'lon topilmadi" });

    const fields = ['title','district','city','address','price','rooms','size','floor',
                    'totalFloors','propertyType','amenities','description','negotiable',
                    'listingType','monthlyRent','deposit','isPublished'];
    fields.forEach(f => { if (req.body[f] !== undefined) listing[f] = req.body[f]; });

    // Yangi rasmlar
    if (req.files?.length > 0) {
      const newImgs = req.files.map(f => `/uploads/${f.filename}`);
      listing.images = [...listing.images, ...newImgs];
    }

    await listing.save();
    res.json({ success: true, listing });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/listings/:id — Admin ────────────────────────
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "E'lon topilmadi" });

    listing.isDeleted = true;
    await listing.save({ validateBeforeSave: false });

    res.json({ success: true, message: "E'lon o'chirildi" });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/listings/:id/favorite ─────────────────────────
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user    = req.user;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "E'lon topilmadi" });

    const idx = user.favorites.indexOf(req.params.id);
    let action;
    if (idx === -1) {
      user.favorites.push(req.params.id);
      listing.favorites += 1;
      action = 'added';
    } else {
      user.favorites.splice(idx, 1);
      listing.favorites = Math.max(0, listing.favorites - 1);
      action = 'removed';
    }

    await user.save({ validateBeforeSave: false });
    await listing.save({ validateBeforeSave: false });

    res.json({ success: true, action, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/listings/user/favorites ────────────────────────
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await req.user.populate('favorites');
    res.json({ success: true, listings: user.favorites });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/listings/:id/inquiry ──────────────────────────
exports.addInquiry = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: "E'lon topilmadi" });
    listing.inquiries += 1;
    await listing.save({ validateBeforeSave: false });
    res.json({ success: true, message: "Murojaat qabul qilindi" });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/valuation ─────────────────────────────────────
exports.getValuation = async (req, res, next) => {
  try {
    const { city = 'Tashkent', district, size = 80, rooms = 2, floor = 4, condition = 'Yaxshi', price } = req.body;

    // Viloyat o'rtacha narxlari
    const basePrices = {
      Tashkent: 1240, Samarkand: 890, Bukhara: 720, Namangan: 680,
      Andijan: 650, Fergana: 700, Qarshi: 580, Jizzax: 520,
      Termiz: 560, Nukus: 480, Navoiy: 610, Urganch: 540,
    };
    const basePerM2 = basePrices[city] || 800;

    // Ko'paytiruvchilar
    const conditionMult = condition === 'Yangi' ? 1.15 : condition === 'Yaxshi' ? 1.0 : 0.85;
    const floorMult     = parseInt(floor) > 10 ? 1.08 : parseInt(floor) === 1 ? 0.93 : 1.0;
    const roomsMult     = parseInt(rooms) <= 1 ? 0.95 : parseInt(rooms) >= 4 ? 1.05 : 1.0;

    const estPerM2  = Math.round(basePerM2 * conditionMult * floorMult * roomsMult);
    const totalEst  = estPerM2 * parseInt(size);
    const currentP  = parseInt(price) || totalEst;
    const diff      = parseFloat(((totalEst - currentP) / currentP * 100).toFixed(1));

    const factors = [];
    if (conditionMult > 1) factors.push('Yangi bino bonusi (+15%)');
    if (conditionMult < 1) factors.push("Ta'mirlash kerak chegirmasi (-15%)");
    if (floorMult > 1)     factors.push("Yuqori qavat bonusi (+8%)");
    if (floorMult < 1)     factors.push('Birinchi qavat chegirmasi (-7%)');
    if (roomsMult > 1)     factors.push('Ko\'p xona bonusi (+5%)');
    factors.push(`${city} bozor o'rtachasi: $${basePerM2}/m²`);

    // Kredit sarflanishi
    if (req.user && req.user.credits > 0) {
      req.user.credits = Math.max(0, req.user.credits - 1);
      await req.user.save({ validateBeforeSave: false });
    }

    res.json({
      success: true,
      currentPrice: currentP,
      estimatedValue: totalEst,
      estPerM2,
      marketAvg: basePerM2,
      priceDiff: diff,
      status: diff > 5 ? 'underpriced' : diff < -5 ? 'overpriced' : 'fair',
      factors,
      creditsLeft: req.user?.credits,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/market ─────────────────────────────────────────
exports.getMarket = async (req, res) => {
  const regions = [
    { city: 'TASHKENT',   pricePerM2: '$1,240/m²', change: '+4.2%', trend: 'up',     note: 'Mirabaddagi yuqori talab narxlarni oshirmoqda.' },
    { city: 'SAMARKAND',  pricePerM2: '$890/m²',   change: '+2.8%', trend: 'up',     note: "Turizm o'sishi ijara daromadlarini oshirmoqda." },
    { city: 'BUKHARA',    pricePerM2: '$720/m²',   change: '+1.5%', trend: 'up',     note: "Tourist growth sparking residential rental yields." },
    { city: 'NAMANGAN',   pricePerM2: '$680/m²',   change: '+3.1%', trend: 'up',     note: "Sanoat o'sishi bilan turar-joy talabi oshmoqda." },
    { city: 'ANDIJAN',    pricePerM2: '$650/m²',   change: '+2.3%', trend: 'up',     note: "Ferghana vodiysi iqtisodiyoti rivojlanmoqda." },
    { city: 'FERGANA',    pricePerM2: '$700/m²',   change: '+2.6%', trend: 'up',     note: "Savdo markazi sifatida rivojlanmoqda." },
    { city: 'QARSHI',     pricePerM2: '$580/m²',   change: '+1.8%', trend: 'up',     note: 'Neft-gaz sanoati talebni oshirmoqda.' },
    { city: 'JIZZAX',     pricePerM2: '$520/m²',   change: '+0.9%', trend: 'stable', note: "Iqtisodiy faollik rivojlanish bosqichida." },
    { city: 'NAVOIY',     pricePerM2: '$610/m²',   change: '+2.1%', trend: 'up',     note: "Kimyo sanoati o'sishi talabni oshirmoqda." },
    { city: 'URGANCH',    pricePerM2: '$540/m²',   change: '+1.6%', trend: 'up',     note: "Xorazm viloyati markazi rivojlanmoqda." },
    { city: 'TERMIZ',     pricePerM2: '$560/m²',   change: '+1.2%', trend: 'up',     note: "Chegara savdosi faolligi ta'sir ko'rsatmoqda." },
    { city: 'NUKUS',      pricePerM2: '$480/m²',   change: '+0.5%', trend: 'stable', note: "Qoraqalpog'iston poytaxti, sekin rivojlanish." },
  ];
  res.json({ success: true, regions });
};
