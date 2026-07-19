require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Database connection and seeding using Prisma (MySQL)
const prisma = require('./prismaClient');

async function seedDefaultData() {
  try {
    // Seed a default User if none exists
    let defaultUser = await prisma.user.findUnique({
      where: { email: 'farmer.john@cropmax.ai' }
    });
    if (!defaultUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      defaultUser = await prisma.user.create({
        data: {
          name: 'Farmer John',
          email: 'farmer.john@cropmax.ai',
          password: hashedPassword,
          role: 'Farmer'
        }
      });
      console.log('🌱 Seeded default User ID:', defaultUser.id);
    } else {
      console.log('🌱 Default User already exists ID:', defaultUser.id);
      if (!defaultUser.password) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await prisma.user.update({
          where: { id: defaultUser.id },
          data: { password: hashedPassword }
        });
        console.log('🌱 Updated password for existing default user');
      }
    }

    // Seed a default Category if none exists
    let defaultCategory = await prisma.category.findUnique({
      where: { name: 'General' }
    });
    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          name: 'General',
          description: 'General category for crops'
        }
      });
      console.log('🌱 Seeded default Category ID:', defaultCategory.id);
    } else {
      console.log('🌱 Default Category already exists ID:', defaultCategory.id);
    }

    // Seed default crops if empty
    let count = await prisma.crop.count();
    if (count === 0) {
      const defaultCrops = [
        {
          name: "Mango",
          quantity: 15,
          unit: "Quintals",
          location: "Nashik, Maharashtra",
          status: "Processing Recommended",
          advice: "Convert to Mango Pulp/Pickle/Juice. Local processor price spreads show a (+88% profit) increase compared to fresh market value.",
          userId: defaultUser.id,
          categoryId: defaultCategory.id
        },
        {
          name: "Tomato",
          quantity: 8,
          unit: "Quintals",
          location: "Kolar, Karnataka",
          status: "Hold Recommended",
          advice: "Hold Tomato for 3 weeks. APMC wholesale arrivals are peaking in neighboring districts; prices are projected to rise by 25% once gluts clear.",
          userId: defaultUser.id,
          categoryId: defaultCategory.id
        }
      ];
      await prisma.crop.createMany({
        data: defaultCrops
      });
      console.log('🌱 Seeded default crops.');
    } else {
      console.log('🌱 Crops already contain records.');
    }
  } catch (error) {
    console.error('❌ Error seeding default data:', error);
  }
}

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL successfully via Prisma.');
    await seedDefaultData();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('⚠️ Running server with pending database configuration.');
  }
}

connectDB();

// Configure CORS to allow access from the frontend
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Built-in body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'CropMax AI Backend Service is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Import Auth and Crop Routes
const authRouter = require('./routes/auth');
const cropRouter = require('./routes/crops');
const aiRouter = require('./routes/ai');
app.use('/api/auth', authRouter);
app.use('/api/crops', cropRouter);
app.use('/api/ai', aiRouter);

// Catch-all route for unmatched paths (404 Not Found)
app.use((req, res, next) => {
  const err = new Error(`Cannot ${req.method} ${req.url}`);
  err.status = 404;
  next(err);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[Error Handler] Status ${status}: ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🌾 CropMax AI Backend Server Started`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed Origin: ${FRONTEND_URL}`);
  console.log(`==================================================`);
});

// Handle termination signals gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
