# Authentication & Authorization System

## Overview

This is a multi-tenant SaaS system with role-based access control:

- **Super Admin**: Manages all organizations (no UI, backend only)
- **Organization Admin**: Manages their organization
- **Captain/Admin**: Restaurant staff
- **Customer**: Access via QR code/table link

## Setup

### 1. Create Super Admin

```bash
cd backend
npm run create-super-admin
```

Default credentials:
- Username: `superadmin`
- Password: `admin123`

**⚠️ Change password after first login!**

Or set custom credentials in `.env`:
```env
SUPER_ADMIN_USERNAME=your_username
SUPER_ADMIN_PASSWORD=your_secure_password
```

### 2. Clean Database (Optional)

To start fresh:
```bash
npm run clean-db
```

This will:
- Drop all collections
- Keep super admin user
- Ready for fresh start

## Authentication Endpoints

### Super Admin Login
```bash
POST /api/auth/super-admin/login
Body: {
  "username": "superadmin",
  "password": "admin123"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "username": "superadmin",
    "role": "super_admin"
  }
}
```

### Organization Admin Login
```bash
POST /api/auth/org-admin/login
Body: {
  "username": "org_admin_username",
  "password": "password",
  "orgId": "ORG123456"
}
```

### Staff Login (Captain/Admin)
```bash
POST /api/auth/staff/login
Body: {
  "username": "staff_username",
  "password": "password",
  "orgId": "ORG123456"
}
```

### Customer Access (No Login)
```bash
GET /api/auth/customer/access/:orgId
```

Returns organization info for QR code access.

### Get Current User
```bash
GET /api/auth/me
Headers: {
  "Authorization": "Bearer jwt_token_here"
}
```

## Organization Management (Super Admin Only)

### Create Organization with Admin
```bash
POST /api/organizations
Headers: {
  "Authorization": "Bearer super_admin_token"
}
Body: {
  "name": "Restaurant Name",
  "email": "restaurant@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "adminUsername": "admin",
  "adminPassword": "secure_password",
  "adminName": "Admin Name"
}
```

Response:
```json
{
  "organization": {
    "id": "...",
    "name": "Restaurant Name",
    "orgId": "ORG1234567890ABCD",
    "email": "restaurant@example.com",
    "slug": "restaurant-name"
  },
  "admin": {
    "username": "admin",
    "role": "org_admin"
  },
  "message": "Organization and admin user created successfully"
}
```

### Get All Organizations
```bash
GET /api/organizations
Headers: {
  "Authorization": "Bearer super_admin_token"
}
```

### Get Organization Users
```bash
GET /api/organizations/:id/users
Headers: {
  "Authorization": "Bearer super_admin_token"
}
```

### Create User for Organization
```bash
POST /api/organizations/:id/users
Headers: {
  "Authorization": "Bearer super_admin_token"
}
Body: {
  "username": "captain1",
  "password": "password123",
  "role": "captain",
  "name": "Captain Name",
  "email": "captain@example.com",
  "phone": "+1234567890"
}
```

Valid roles: `org_admin`, `captain`, `admin`, `customer`

## Using Authentication

### In API Requests

Include token in headers:
```javascript
fetch('http://localhost:5000/api/organizations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Frontend Example

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/super-admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Use token in subsequent requests
const orgResponse = await fetch('http://localhost:5000/api/organizations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Workflow

1. **Super Admin** logs in via backend API
2. **Super Admin** creates organization with admin user
3. **Organization Admin** logs in with orgId
4. **Organization Admin** can create staff users (captain/admin)
5. **Customers** access via QR code (no login required)

## Security Notes

- All passwords are hashed with bcrypt
- JWT tokens expire in 7 days
- Super admin routes require authentication + authorization
- Organization data is isolated by orgId
- Users can only access their organization's data

