# Smart Server Backend API

Node.js/Express backend with MongoDB for Smart Server Restaurant Management System.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local installation or MongoDB Atlas account)

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a Windows service and start automatically
4. Default connection: `mongodb://localhost:27017`

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (Free tier: M0)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string from "Connect" → "Connect your application"
7. It will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-server?retryWrites=true&w=majority`

### 3. MongoDB Compass (UI Tool)

**Download and Install:**
1. Download MongoDB Compass from [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Install the application
3. Connect to your MongoDB:
   - **Local:** `mongodb://localhost:27017`
   - **Atlas:** Use the connection string from Atlas dashboard

### 4. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and configure:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/smart-server
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart-server?retryWrites=true&w=majority
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Restaurants
- `GET /api/restaurants/:orgId` - Get restaurant by orgId
- `POST /api/restaurants` - Create or update restaurant
- `PUT /api/restaurants/:orgId` - Update restaurant
- `PATCH /api/restaurants/:orgId/logo` - Update logo
- `PATCH /api/restaurants/:orgId/location` - Update location
- `GET /api/restaurants/:orgId/charges` - Get charges
- `POST /api/restaurants/:orgId/charges` - Add charge
- `PUT /api/restaurants/:orgId/charges/:chargeId` - Update charge
- `DELETE /api/restaurants/:orgId/charges/:chargeId` - Delete charge

### Menu Items
- `GET /api/menu-items/:orgId` - Get all menu items
- `GET /api/menu-items/:orgId/item/:itemId` - Get single menu item
- `POST /api/menu-items/:orgId` - Create menu item
- `PUT /api/menu-items/:orgId/item/:itemId` - Update menu item
- `DELETE /api/menu-items/:orgId/item/:itemId` - Delete menu item

### Categories
- `GET /api/categories/:orgId` - Get all categories
- `POST /api/categories/:orgId` - Create category
- `PUT /api/categories/:orgId/category/:categoryId` - Update category
- `DELETE /api/categories/:orgId/category/:categoryId` - Delete category

### Orders
- `GET /api/orders/:orgId` - Get all orders
- `GET /api/orders/:orgId/order/:orderId` - Get single order
- `POST /api/orders/:orgId` - Create order
- `PUT /api/orders/:orgId/order/:orderId` - Update order
- `PATCH /api/orders/:orgId/order/:orderId/status` - Update order status
- `DELETE /api/orders/:orgId/order/:orderId` - Delete order

### History
- `GET /api/history/:orgId` - Get order history
- `GET /api/history/:orgId/order/:orderId` - Get single history entry
- `DELETE /api/history/:orgId/order/:orderId` - Delete history entry

### Menu Suggestions
- `GET /api/menu-suggestions/:orgId` - Get menu suggestions
- `PUT /api/menu-suggestions/:orgId` - Update menu suggestions

## Database Collections

- `restaurants` - Restaurant information
- `menuitems` - Menu items
- `categories` - Menu categories
- `orders` - Active orders
- `histories` - Completed orders history
- `menusuggestions` - Menu suggestions

## Troubleshooting

### MongoDB Connection Issues

1. **Local MongoDB not running:**
   - Windows: Check Services → MongoDB
   - macOS/Linux: `sudo systemctl status mongodb` or `brew services list`

2. **Connection refused:**
   - Verify MongoDB is running on port 27017
   - Check firewall settings

3. **Atlas Connection Issues:**
   - Verify IP whitelist includes your IP
   - Check username/password in connection string
   - Ensure cluster is running (not paused)

### Port Already in Use

If port 5000 is in use, change it in `.env`:
```env
PORT=5001
```

## Development Tips

1. Use MongoDB Compass to view and manage data
2. Check server logs for debugging
3. Use Postman or similar tool to test API endpoints
4. Enable CORS for frontend development

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use MongoDB Atlas for production database
3. Set secure `JWT_SECRET`
4. Configure proper CORS origins
5. Use environment variables for all sensitive data

