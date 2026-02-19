# African Fashion eCommerce - API Documentation

Base URL: `http://localhost:3001`

## Authentication Endpoints

### POST /auth/register
Register a new user with email and password.

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
    "authProvider": "EMAIL",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### POST /auth/login
Login with email and password.

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

---

## Google OAuth2 Endpoints

### Google OAuth2 Flow

1. Frontend calls `POST /auth/google` to get the Google authorization URL.
2. Frontend redirects user to the returned `authUrl`.
3. User logs in with Google and is redirected back with an authorization code.
4. Frontend sends the code to `POST /auth/google/callback`.
5. Backend exchanges the code for Google tokens, looks up or creates the user, and returns JWT tokens.

### Environment Variables Required

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth2 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth2 client secret from Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | Redirect URI registered in Google Cloud Console (e.g. `http://localhost:3001/auth/google/callback`) |

### POST /auth/google
Returns the Google OAuth2 authorization URL. The frontend should redirect the user to this URL.

**Request Body:** _(none)_

**Response (200):**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=openid+email+profile&access_type=offline&prompt=consent"
}
```

### POST /auth/google/callback
Exchange the Google authorization code for JWT tokens. This endpoint is protected by the Google Passport strategy which calls Google's token endpoint internally.

**Request Body:**
```json
{
  "code": "4/0AfJohXm..."
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "fullName": "Jane Doe",
    "googleId": "1234567890",
    "googleEmail": "user@gmail.com",
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "authProvider": "GOOGLE",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Account Linking:**
- If the Google email matches an existing email/password account, the accounts are linked automatically and `authProvider` is updated to `EMAIL_GOOGLE`.
- If no existing account is found, a new account is created with `authProvider: GOOGLE`.

---

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
  "authProvider": "EMAIL",
  "googleId": null,
  "googleEmail": null,
  "profilePicture": null,
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

---

## Legacy Endpoints

### GET /health
Health check endpoint.

### GET /products
List all products.

### GET /fabrics
List all fabrics.

### GET /designers
List all designers.

---

## User Roles

| Role | Description |
|------|-------------|
| CUSTOMER | Regular buyer |
| DESIGNER | Fashion designer |
| FABRIC_SELLER | Fabric supplier |
| QA | Quality assurance |
| ADMIN | Platform administrator |

## Auth Providers

| Provider | Description |
|----------|-------------|
| EMAIL | Registered with email and password |
| GOOGLE | Registered via Google OAuth2 |
| EMAIL_GOOGLE | Email account with linked Google account |
