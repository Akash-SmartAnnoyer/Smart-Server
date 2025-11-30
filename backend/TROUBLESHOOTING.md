# Troubleshooting Guide

## Backend Server Crashes

### Issue: "MongoDB connection error" or "app crashed"

**Solution 1: MongoDB Not Running**
```bash
# Windows: Check Services
# Press Win+R, type: services.msc
# Find "MongoDB" and make sure it's "Running"

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb
```

**Solution 2: Missing .env File**
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # macOS/Linux
   ```

2. Edit `.env` and set:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smart-server
   ```

**Solution 3: Wrong Port**
- MongoDB default port is 27017
- Check if MongoDB is running on different port
- Update `.env` with correct port

### Issue: "Port 5000 already in use"

**Solution:**
Change port in `backend/.env`:
```env
PORT=5001
```

Then update frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

## Frontend Issues

### Issue: "WebSocket server is running" instead of React app

**Problem:** `package.json` has wrong start script

**Solution:** Already fixed! Use:
```bash
npm start          # Starts React app
npm run websocket  # Starts websocket server (separate)
```

### Issue: CORS Errors

**Solution:** Backend already has CORS enabled. If you see CORS errors:
1. Check backend is running on correct port
2. Verify `REACT_APP_API_URL` in frontend `.env`
3. Check browser console for exact error

## MongoDB Connection Issues

### Issue: "Connection refused"

**Checklist:**
1. ✅ MongoDB service is running
2. ✅ Port 27017 is not blocked by firewall
3. ✅ Connection string in `.env` is correct
4. ✅ Try connecting via MongoDB Compass first

### Issue: "Authentication failed" (MongoDB Atlas)

**Solution:**
1. Check username/password in connection string
2. Verify IP is whitelisted in Atlas
3. Check cluster is not paused

## Quick Fixes

### Restart Everything
```bash
# Stop all processes (Ctrl+C)

# Start MongoDB
# Windows: Services → MongoDB → Start
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb

# Start Backend
cd backend
npm run dev

# Start Frontend (new terminal)
cd Smart-Server
npm start
```

### Check MongoDB Status
```bash
# Windows: services.msc → MongoDB
# macOS: brew services list
# Linux: sudo systemctl status mongodb
```

### Test MongoDB Connection
Open MongoDB Compass and connect to: `mongodb://localhost:27017`

### Test Backend API
Open browser: http://localhost:5000/api/health
Should see: `{"status":"OK",...}`

## Still Having Issues?

1. Check all `.env` files exist and are configured
2. Verify MongoDB is running
3. Check port conflicts
4. Review server logs for specific errors
5. Try restarting everything

