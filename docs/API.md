# API Documentation

Base URL: `http://localhost:3000`

## Authentication

All protected endpoints require: `Authorization: Bearer {accessToken}`

---

## POST /auth/register

Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "country": "Nigeria",
  "role": "CUSTOMER"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "country": "Nigeria",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:** 409 if email exists

---

## POST /auth/login

Login with email and password.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "country": "Nigeria",
    "role": "CUSTOMER"
  }
}
```

**Errors:** 401 if invalid credentials

---

## POST /auth/refresh

Refresh access token.

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:** 401 if invalid token

---

## GET /users/:id

Get user profile.

**Headers:** `Authorization: Bearer {accessToken}`

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "country": "Nigeria",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:** 403 if not self or admin, 404 if not found

---

## PATCH /users/:id

Update user profile.

**Headers:** `Authorization: Bearer {accessToken}`

**Body:**
```json
{
  "fullName": "Jane Doe",
  "country": "Ghana"
}
```

**Response 200:** Updated user object

**Errors:** 403 if not self or admin (role changes admin only)

---

## GET /health

Health check endpoint.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "database": "connected"
}
```

---

## User Roles

- `CUSTOMER` - Regular customer
- `DESIGNER` - Fashion designer
- `FABRIC_SELLER` - Fabric seller
- `QA` - Quality assurance
- `ADMIN` - Administrator
