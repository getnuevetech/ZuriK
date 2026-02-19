# API Reference - African Fashion eCommerce Backend

Base URL (local): `http://localhost:3000`  
Base URL (Railway): `https://<your-app>.railway.app`

---

## Health Check

### `GET /health`

Returns the current health status of the backend service. Used by Railway to verify the service is running.

**Authentication:** None (public endpoint)

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 42,
  "database": "connected",
  "version": "1.0.0"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"ok"` \| `"error"` | Service status |
| `timestamp` | ISO 8601 string | Current server time |
| `uptime` | number | Server uptime in seconds |
| `database` | `"connected"` \| `"disconnected"` | PostgreSQL connection status |
| `version` | string | API version |

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Service is healthy |

---

## Products

### `GET /products`

Returns all products.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ankara Fabric Bundle",
    "description": "Premium quality Ankara fabric",
    "price": "45.99",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Fabrics

### `GET /fabrics`

Returns all fabric types.

**Response:**
```json
[
  {
    "id": 1,
    "name": "100% Cotton Ankara",
    "type": "Ankara",
    "width": "45 inches",
    "price": "12.99",
    "origin": "Ghana",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Designers

### `GET /designers`

Returns all designer profiles.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Stella Jean",
    "country": "Haiti/Italy",
    "specialty": "Contemporary African Fashion",
    "bio": "Stella Jean brings African aesthetics to modern design",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Railway Deployment

After deploying to Railway, replace the base URL:

```bash
# Local
curl http://localhost:3000/health

# Railway (replace with your actual Railway URL)
curl https://your-app.railway.app/health
```

All endpoints work identically in both environments.
