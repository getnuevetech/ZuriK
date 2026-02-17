# African Fashion eCommerce - API Documentation

Complete REST API documentation for the African Fashion eCommerce platform.

**Base URL**: `http://localhost:3001/api` (Development)  
**Production URL**: `https://your-domain.com/api`

**API Version**: 1.0  
**Interactive Documentation**: Available at `/api/docs` (Swagger UI)

---

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Designs](#designs)
- [Fabrics](#fabrics)
- [Orders](#orders)
- [Measurements](#measurements)
- [Admin](#admin)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

All authentication endpoints for user registration, login, and token management.

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`  
**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "phone": "+1234567890",
  "country": "Nigeria"
}
```

**Roles**: `CUSTOMER`, `DESIGNER`, `FABRIC_SELLER`, `ADMIN`

**Response** (201 Created):
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "phone": "+1234567890",
    "country": "Nigeria",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "phone": "+1234567890",
    "country": "Nigeria"
  }'
```

---

### Login

Authenticate and receive access tokens.

**Endpoint**: `POST /auth/login`  
**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### Refresh Token

Get a new access token using a refresh token.

**Endpoint**: `POST /auth/refresh`  
**Authentication**: Not required (but needs refresh token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK):
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /auth/me`  
**Authentication**: Required (Bearer Token)

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "phone": "+1234567890",
    "country": "Nigeria",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Users

User profile management endpoints.

### Get User Profile

Get the current authenticated user's profile.

**Endpoint**: `GET /users/me`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "phone": "+1234567890",
    "country": "Nigeria",
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos State",
    "zipCode": "100001",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get User by ID

Get a specific user's public profile.

**Endpoint**: `GET /users/:id`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DESIGNER",
    "country": "Kenya",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Update User Profile

Update the authenticated user's profile.

**Endpoint**: `PATCH /users/:id`  
**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": "456 New Street",
  "city": "Nairobi",
  "state": "Nairobi County",
  "zipCode": "00100",
  "country": "Kenya"
}
```

**Response** (200 OK):
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "address": "456 New Street",
    "city": "Nairobi",
    "country": "Kenya"
  }
}
```

**cURL Example**:
```bash
curl -X PATCH http://localhost:3001/api/users/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "phone": "+1234567890"
  }'
```

---

## Designs

Fashion design catalog endpoints.

### Get All Designs

Retrieve all designs with optional filters.

**Endpoint**: `GET /designs`  
**Authentication**: Not required

**Query Parameters**:
- `category` (optional): Filter by category (`TRADITIONAL`, `MODERN`, `FUSION`, `ACCESSORIES`)
- `country` (optional): Filter by designer's country
- `designerId` (optional): Filter by designer ID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response** (200 OK):
```json
{
  "designs": [
    {
      "id": "uuid-here",
      "name": "Ankara Evening Gown",
      "description": "Beautiful evening gown with traditional Ankara print",
      "category": "TRADITIONAL",
      "price": 150.00,
      "images": ["https://cloudinary.com/image1.jpg"],
      "customizable": true,
      "fabricRequired": 3.5,
      "designer": {
        "id": "designer-uuid",
        "firstName": "Amina",
        "lastName": "Mohamed",
        "country": "Nigeria"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**cURL Example**:
```bash
# Get all designs
curl -X GET http://localhost:3001/api/designs

# Filter by category and country
curl -X GET "http://localhost:3001/api/designs?category=TRADITIONAL&country=Nigeria"

# Filter by price range
curl -X GET "http://localhost:3001/api/designs?minPrice=50&maxPrice=200"
```

---

### Get Design by ID

Get detailed information about a specific design.

**Endpoint**: `GET /designs/:id`  
**Authentication**: Not required

**Response** (200 OK):
```json
{
  "design": {
    "id": "uuid-here",
    "name": "Ankara Evening Gown",
    "description": "Beautiful evening gown with traditional Ankara print",
    "category": "TRADITIONAL",
    "price": 150.00,
    "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
    "customizable": true,
    "fabricRequired": 3.5,
    "fabricType": "ANKARA",
    "designTime": 14,
    "sizes": ["S", "M", "L", "XL"],
    "designer": {
      "id": "designer-uuid",
      "firstName": "Amina",
      "lastName": "Mohamed",
      "country": "Nigeria",
      "bio": "Experienced fashion designer specializing in traditional African wear"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/designs/uuid-here
```

---

### Create Design

Create a new design listing (Designer only).

**Endpoint**: `POST /designs`  
**Authentication**: Required (Designer or Admin role)

**Request Body**:
```json
{
  "name": "Kente Jacket",
  "description": "Modern jacket featuring traditional Kente cloth patterns",
  "category": "FUSION",
  "price": 200.00,
  "images": ["https://cloudinary.com/image1.jpg"],
  "customizable": true,
  "fabricRequired": 2.5,
  "fabricType": "KENTE",
  "designTime": 10,
  "sizes": ["S", "M", "L", "XL", "XXL"]
}
```

**Response** (201 Created):
```json
{
  "message": "Design created successfully",
  "design": {
    "id": "uuid-here",
    "name": "Kente Jacket",
    "description": "Modern jacket featuring traditional Kente cloth patterns",
    "category": "FUSION",
    "price": 200.00,
    "customizable": true,
    "designerId": "designer-uuid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/designs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kente Jacket",
    "description": "Modern jacket featuring traditional Kente cloth patterns",
    "category": "FUSION",
    "price": 200.00,
    "images": ["https://cloudinary.com/image1.jpg"],
    "customizable": true,
    "fabricRequired": 2.5,
    "fabricType": "KENTE",
    "designTime": 10,
    "sizes": ["S", "M", "L", "XL", "XXL"]
  }'
```

---

### Update Design

Update an existing design (Designer/Admin only).

**Endpoint**: `PATCH /designs/:id`  
**Authentication**: Required (Designer or Admin role)

**Request Body** (all fields optional):
```json
{
  "name": "Updated Design Name",
  "price": 175.00,
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "message": "Design updated successfully",
  "design": {
    "id": "uuid-here",
    "name": "Updated Design Name",
    "price": 175.00,
    "updatedAt": "2024-01-16T11:00:00Z"
  }
}
```

---

### Delete Design

Delete a design listing (Designer/Admin only).

**Endpoint**: `DELETE /designs/:id`  
**Authentication**: Required (Designer or Admin role)

**Response** (200 OK):
```json
{
  "message": "Design deleted successfully"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3001/api/designs/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Fabrics

Fabric marketplace endpoints.

### Get All Fabrics

Retrieve all fabric listings with optional filters.

**Endpoint**: `GET /fabrics`  
**Authentication**: Not required

**Query Parameters**:
- `fabricType` (optional): Filter by type (`ANKARA`, `KENTE`, `DASHIKI`, `KITENGE`, `MUDCLOTH`, `ADIRE`, `OTHER`)
- `country` (optional): Filter by seller's country
- `sellerId` (optional): Filter by seller ID
- `minPrice` (optional): Minimum price per yard
- `maxPrice` (optional): Maximum price per yard

**Response** (200 OK):
```json
{
  "fabrics": [
    {
      "id": "uuid-here",
      "name": "Premium Ankara Fabric",
      "description": "High-quality Ankara fabric with vibrant patterns",
      "fabricType": "ANKARA",
      "pricePerYard": 15.00,
      "stockQuantity": 100,
      "images": ["https://cloudinary.com/fabric1.jpg"],
      "colors": ["Red", "Blue", "Yellow"],
      "patterns": ["Geometric", "Floral"],
      "seller": {
        "id": "seller-uuid",
        "firstName": "Kwame",
        "lastName": "Asante",
        "country": "Ghana"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**cURL Example**:
```bash
# Get all fabrics
curl -X GET http://localhost:3001/api/fabrics

# Filter by fabric type
curl -X GET "http://localhost:3001/api/fabrics?fabricType=ANKARA"

# Filter by price range
curl -X GET "http://localhost:3001/api/fabrics?minPrice=10&maxPrice=25"
```

---

### Get Fabric by ID

Get detailed information about a specific fabric.

**Endpoint**: `GET /fabrics/:id`  
**Authentication**: Not required

**Response** (200 OK):
```json
{
  "fabric": {
    "id": "uuid-here",
    "name": "Premium Ankara Fabric",
    "description": "High-quality Ankara fabric with vibrant patterns",
    "fabricType": "ANKARA",
    "pricePerYard": 15.00,
    "stockQuantity": 100,
    "images": ["https://cloudinary.com/fabric1.jpg", "https://cloudinary.com/fabric2.jpg"],
    "colors": ["Red", "Blue", "Yellow"],
    "patterns": ["Geometric", "Floral"],
    "width": 45,
    "material": "100% Cotton",
    "careInstructions": "Machine wash cold, tumble dry low",
    "seller": {
      "id": "seller-uuid",
      "firstName": "Kwame",
      "lastName": "Asante",
      "country": "Ghana",
      "rating": 4.8
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Create Fabric

Create a new fabric listing (Fabric Seller only).

**Endpoint**: `POST /fabrics`  
**Authentication**: Required (Fabric Seller or Admin role)

**Request Body**:
```json
{
  "name": "Traditional Kente Cloth",
  "description": "Authentic handwoven Kente cloth from Ghana",
  "fabricType": "KENTE",
  "pricePerYard": 25.00,
  "stockQuantity": 50,
  "images": ["https://cloudinary.com/kente1.jpg"],
  "colors": ["Gold", "Green", "Red"],
  "patterns": ["Striped"],
  "width": 48,
  "material": "Silk blend",
  "careInstructions": "Dry clean only"
}
```

**Response** (201 Created):
```json
{
  "message": "Fabric created successfully",
  "fabric": {
    "id": "uuid-here",
    "name": "Traditional Kente Cloth",
    "fabricType": "KENTE",
    "pricePerYard": 25.00,
    "sellerId": "seller-uuid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/fabrics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Traditional Kente Cloth",
    "description": "Authentic handwoven Kente cloth from Ghana",
    "fabricType": "KENTE",
    "pricePerYard": 25.00,
    "stockQuantity": 50,
    "images": ["https://cloudinary.com/kente1.jpg"],
    "colors": ["Gold", "Green", "Red"],
    "patterns": ["Striped"]
  }'
```

---

### Update Fabric

Update fabric listing (Fabric Seller/Admin only).

**Endpoint**: `PATCH /fabrics/:id`  
**Authentication**: Required (Fabric Seller or Admin role)

**Request Body** (all fields optional):
```json
{
  "pricePerYard": 22.00,
  "stockQuantity": 75
}
```

**Response** (200 OK):
```json
{
  "message": "Fabric updated successfully",
  "fabric": {
    "id": "uuid-here",
    "pricePerYard": 22.00,
    "stockQuantity": 75,
    "updatedAt": "2024-01-16T11:00:00Z"
  }
}
```

---

### Delete Fabric

Delete a fabric listing (Fabric Seller/Admin only).

**Endpoint**: `DELETE /fabrics/:id`  
**Authentication**: Required (Fabric Seller or Admin role)

**Response** (200 OK):
```json
{
  "message": "Fabric deleted successfully"
}
```

---

## Orders

Order management endpoints.

### Create Order

Create a new order.

**Endpoint**: `POST /orders`  
**Authentication**: Required

**Request Body**:
```json
{
  "items": [
    {
      "itemType": "DESIGN",
      "itemId": "design-uuid",
      "quantity": 1,
      "price": 150.00,
      "customization": {
        "size": "M",
        "fabricId": "fabric-uuid",
        "measurementId": "measurement-uuid",
        "specialInstructions": "Add extra length to sleeves"
      }
    },
    {
      "itemType": "FABRIC",
      "itemId": "fabric-uuid",
      "quantity": 5,
      "price": 15.00
    }
  ],
  "shippingAddress": {
    "address": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "zipCode": "100001",
    "phone": "+1234567890"
  },
  "paymentMethod": "STRIPE"
}
```

**Response** (201 Created):
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "uuid-here",
    "orderNumber": "AFE-2024-001234",
    "status": "PENDING",
    "items": [...],
    "subtotal": 225.00,
    "shippingCost": 15.00,
    "tax": 20.00,
    "total": 260.00,
    "shippingAddress": {...},
    "paymentMethod": "STRIPE",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "itemType": "DESIGN",
        "itemId": "design-uuid",
        "quantity": 1,
        "price": 150.00
      }
    ],
    "shippingAddress": {
      "address": "123 Main Street",
      "city": "Lagos",
      "country": "Nigeria"
    },
    "paymentMethod": "STRIPE"
  }'
```

---

### Get User Orders

Retrieve all orders for the authenticated user.

**Endpoint**: `GET /orders`  
**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)

**Response** (200 OK):
```json
{
  "orders": [
    {
      "id": "uuid-here",
      "orderNumber": "AFE-2024-001234",
      "status": "PROCESSING",
      "total": 260.00,
      "createdAt": "2024-01-15T10:30:00Z",
      "items": [
        {
          "itemType": "DESIGN",
          "name": "Ankara Evening Gown",
          "quantity": 1,
          "price": 150.00
        }
      ]
    }
  ],
  "count": 1
}
```

**cURL Example**:
```bash
# Get all orders
curl -X GET http://localhost:3001/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Filter by status
curl -X GET "http://localhost:3001/api/orders?status=DELIVERED" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Order by ID

Get detailed information about a specific order.

**Endpoint**: `GET /orders/:id`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "order": {
    "id": "uuid-here",
    "orderNumber": "AFE-2024-001234",
    "status": "PROCESSING",
    "items": [...],
    "subtotal": 225.00,
    "shippingCost": 15.00,
    "tax": 20.00,
    "total": 260.00,
    "shippingAddress": {
      "address": "123 Main Street",
      "city": "Lagos",
      "state": "Lagos State",
      "country": "Nigeria",
      "zipCode": "100001"
    },
    "paymentMethod": "STRIPE",
    "paymentStatus": "PAID",
    "trackingNumber": "TRK123456789",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

---

### Update Order Status

Update the status of an order (Admin/Seller only).

**Endpoint**: `PATCH /orders/:id/status`  
**Authentication**: Required (Admin, Designer, or Fabric Seller role)

**Request Body**:
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRK123456789"
}
```

**Response** (200 OK):
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "uuid-here",
    "status": "SHIPPED",
    "trackingNumber": "TRK123456789",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X PATCH http://localhost:3001/api/orders/uuid-here/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "trackingNumber": "TRK123456789"
  }'
```

---

## Measurements

User measurements management endpoints.

### Get All Measurements

Retrieve all measurements for the authenticated user.

**Endpoint**: `GET /measurements`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "measurements": [
    {
      "id": "uuid-here",
      "name": "Standard Measurements",
      "bust": 36,
      "waist": 28,
      "hips": 38,
      "shoulderWidth": 15,
      "sleeveLength": 22,
      "inseam": 30,
      "height": 165,
      "unit": "INCHES",
      "isDefault": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/measurements \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Measurement by ID

Get a specific measurement.

**Endpoint**: `GET /measurements/:id`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "measurement": {
    "id": "uuid-here",
    "name": "Standard Measurements",
    "bust": 36,
    "waist": 28,
    "hips": 38,
    "shoulderWidth": 15,
    "sleeveLength": 22,
    "inseam": 30,
    "height": 165,
    "unit": "INCHES",
    "isDefault": true,
    "notes": "Prefer loose fit",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Create Measurement

Create a new measurement profile.

**Endpoint**: `POST /measurements`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "Evening Wear Measurements",
  "bust": 36,
  "waist": 28,
  "hips": 38,
  "shoulderWidth": 15,
  "sleeveLength": 22,
  "inseam": 30,
  "height": 165,
  "unit": "INCHES",
  "isDefault": false,
  "notes": "Prefer fitted style"
}
```

**Response** (201 Created):
```json
{
  "message": "Measurement created successfully",
  "measurement": {
    "id": "uuid-here",
    "name": "Evening Wear Measurements",
    "bust": 36,
    "waist": 28,
    "hips": 38,
    "unit": "INCHES",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/measurements \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evening Wear Measurements",
    "bust": 36,
    "waist": 28,
    "hips": 38,
    "unit": "INCHES"
  }'
```

---

### Update Measurement

Update an existing measurement.

**Endpoint**: `PATCH /measurements/:id`  
**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "waist": 27,
  "hips": 37,
  "notes": "Lost some weight"
}
```

**Response** (200 OK):
```json
{
  "message": "Measurement updated successfully",
  "measurement": {
    "id": "uuid-here",
    "waist": 27,
    "hips": 37,
    "notes": "Lost some weight",
    "updatedAt": "2024-01-16T11:00:00Z"
  }
}
```

---

### Delete Measurement

Delete a measurement profile.

**Endpoint**: `DELETE /measurements/:id`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "message": "Measurement deleted successfully"
}
```

---

## Admin

Administrative endpoints (Admin role required).

### Get All Orders

Retrieve all orders in the system (Admin only).

**Endpoint**: `GET /admin/orders`  
**Authentication**: Required (Admin role)

**Query Parameters**:
- `status` (optional): Filter by order status

**Response** (200 OK):
```json
{
  "orders": [
    {
      "id": "uuid-here",
      "orderNumber": "AFE-2024-001234",
      "status": "PROCESSING",
      "total": 260.00,
      "customer": {
        "id": "customer-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/admin/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get All Users

Retrieve all users in the system (Admin only).

**Endpoint**: `GET /admin/users`  
**Authentication**: Required (Admin role)

**Query Parameters**:
- `role` (optional): Filter by user role

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "country": "Nigeria",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

**cURL Example**:
```bash
# Get all users
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Filter by role
curl -X GET "http://localhost:3001/api/admin/users?role=DESIGNER" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Update User Role

Change a user's role (Admin only).

**Endpoint**: `PATCH /admin/users/:id/role`  
**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "role": "DESIGNER"
}
```

**Response** (200 OK):
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "DESIGNER",
    "updatedAt": "2024-01-16T11:00:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X PATCH http://localhost:3001/api/admin/users/uuid-here/role \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "role": "DESIGNER"
  }'
```

---

### Get Platform Statistics

Get platform-wide statistics (Admin only).

**Endpoint**: `GET /admin/statistics`  
**Authentication**: Required (Admin role)

**Response** (200 OK):
```json
{
  "statistics": {
    "totalUsers": 1250,
    "totalOrders": 3450,
    "totalRevenue": 523000.00,
    "usersByRole": {
      "CUSTOMER": 1000,
      "DESIGNER": 150,
      "FABRIC_SELLER": 95,
      "ADMIN": 5
    },
    "ordersByStatus": {
      "PENDING": 45,
      "PROCESSING": 120,
      "SHIPPED": 200,
      "DELIVERED": 3000,
      "CANCELLED": 85
    },
    "revenueThisMonth": 45000.00,
    "ordersThisMonth": 320
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/admin/statistics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Error Handling

The API uses standard HTTP status codes and returns errors in a consistent format.

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/designs"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Authentication required or failed |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation error |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error |

### Common Error Examples

#### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "password must be at least 8 characters"
  ],
  "error": "Bad Request"
}
```

#### Authentication Error (401)
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### Permission Error (403)
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

#### Not Found Error (404)
```json
{
  "statusCode": 404,
  "message": "Design not found",
  "error": "Not Found"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse.

**Default Limits**:
- **Authenticated requests**: 100 requests per 15 minutes
- **Unauthenticated requests**: 20 requests per 15 minutes

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

When rate limit is exceeded:
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

---

## Pagination

For endpoints that return lists, pagination is supported using query parameters:

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Items per page

**Example**:
```bash
curl -X GET "http://localhost:3001/api/designs?page=2&limit=10"
```

**Response** (includes pagination metadata):
```json
{
  "designs": [...],
  "count": 10,
  "total": 245,
  "page": 2,
  "totalPages": 25
}
```

---

## Authentication Flow

### Complete Authentication Example

```javascript
// 1. Register new user
const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER'
  })
});
const { accessToken, refreshToken } = await registerResponse.json();

// 2. Use access token for authenticated requests
const designsResponse = await fetch('http://localhost:3001/api/designs', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// 3. Refresh token when access token expires
const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
const newTokens = await refreshResponse.json();
```

---

## Webhooks

### Stripe Payment Webhook

**Endpoint**: `POST /webhooks/stripe`  
**Authentication**: Stripe signature verification

The backend listens for Stripe webhook events to update payment and order status.

**Events Handled**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`

---

## Additional Resources

- **Swagger Documentation**: Visit `/api/docs` for interactive API documentation
- **Postman Collection**: Available in repository at `/docs/postman-collection.json`
- **API Changelog**: See `CHANGELOG.md` for API version history
- **Support**: Contact api-support@africanfashion.com

---

**Last Updated**: January 2024  
**API Version**: 1.0.0
