const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const restaurantRoutes = require('./routes/restaurants');
const menuItemRoutes = require('./routes/menuItems');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const historyRoutes = require('./routes/history');
const menuSuggestionRoutes = require('./routes/menuSuggestions');
const userRoutes = require('./routes/users');
const pendingSelectionRoutes = require('./routes/pendingSelections');

// Initialize Express app
const app = express();

// Connect to MongoDB (non-blocking)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB on startup:', err.message);
});

// Middleware
// CORS configuration - allow requests from frontend
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://smart-server-frontend.onrender.com',
      'https://smart-server.onrender.com',
      'https://smart-server.in',  // Custom domain
      'http://localhost:3000'
    ]
  : ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // For handling base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Server API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        superAdminLogin: '/api/auth/super-admin/login',
        orgAdminLogin: '/api/auth/org-admin/login',
        staffLogin: '/api/auth/staff/login',
        customerAccess: '/api/auth/customer/access/:orgId',
        getMe: '/api/auth/me'
      },
      organizations: '/api/organizations (super admin only)',
      restaurants: '/api/restaurants/:orgId',
      menuItems: '/api/menu-items/:orgId',
      categories: '/api/categories/:orgId',
      orders: '/api/orders/:orgId',
      history: '/api/history/:orgId',
      menuSuggestions: '/api/menu-suggestions/:orgId'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (used by monitoring services like UptimeRobot)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Server API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/menu-suggestions', menuSuggestionRoutes);
app.use('/api/pending-selections', pendingSelectionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app;
