# African Fashion eCommerce - API Documentation (Phase 1)

Base URL: `http://localhost:3001`

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "Jane Doe",
  "country": "Nigeria",
  "role": "CUSTOMER"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "country": "Nigeria",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### POST /auth/login
Login and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):** Same as register response.

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

## User Endpoints

All user endpoints require `Authorization: Bearer <accessToken>` header.

### GET /users/:id
Get user profile. Users can only access their own profile; admins can access any.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Jane Doe",
  "country": "Nigeria",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### PATCH /users/:id
Update user profile. Users can only update their own profile; admins can update any.

**Request Body (all fields optional):**
```json
{
  "fullName": "Jane Smith",
  "country": "Ghana"
}
```

**Response (200):** Updated user object.

## Legacy Endpoints

### GET /health
Health check endpoint.

### GET /products
List all products.

### GET /fabrics
List all fabrics.

### GET /designers
List all designers.

## User Roles

| Role | Description |
|------|-------------|
| CUSTOMER | Regular buyer |
| DESIGNER | Fashion designer |
| FABRIC_SELLER | Fabric supplier |
| QA | Quality assurance |
| ADMIN | Platform administrator |
