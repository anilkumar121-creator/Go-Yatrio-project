# GoYatrio Platform — API Documentation

This document describes the REST API foundation for the **GoYatrio** travel platform backend service (`apps/api`).

## Base URL

By default in development: `http://localhost:4000`

---

## Authentication & Authorization

Protected endpoints require a valid JWT passed in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_access_token>
```

### Authentication Endpoints

#### 1. Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "4a7b...",
      "user": {
        "id": "cuid...",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-08-15T02:00:00.000Z"
      }
    }
  }
  ```

#### 2. User Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User authenticated successfully.",
    "data": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "4a7b...",
      "user": {
        "id": "cuid...",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "CUSTOMER"
      }
    }
  }
  ```

#### 3. User Logout
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Access:** Authenticated (`Bearer <token>`)
- **Request Body (Optional):**
  ```json
  {
    "refreshToken": "4a7b..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully.",
    "data": {
      "success": true
    }
  }
  ```

#### 4. Get Current User (`/me`)
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Access:** Authenticated (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Current user fetched successfully.",
    "data": {
      "user": {
        "id": "cuid...",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "CUSTOMER",
        "isActive": true
      }
    }
  }
  ```

#### 5. Refresh Session
- **Method:** `POST`
- **Path:** `/api/auth/refresh`
- **Access:** Public (Requires valid refresh token in body or `X-Refresh-Token` header)
- **Request Body:**
  ```json
  {
    "refreshToken": "4a7b..."
  }
  ```
- **Response (200 OK):** Returns new `accessToken` and rotated `refreshToken`.

#### 6. Change Password
- **Method:** `POST`
- **Path:** `/api/auth/change-password`
- **Access:** Authenticated (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "currentPassword": "SecurePassword123!",
    "newPassword": "NewSecurePassword456!"
  }
  ```
- **Response (200 OK):** Invalidates active sessions and updates password hash.

---

## Health Check APIs

- **`GET /health`** or **`GET /api/status`** or **`GET /api/health`**
- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "service": "goyatrio-api",
      "database": "connected",
      "timestamp": "2026-08-15T02:00:00.000Z"
    }
  }
  ```

---

## CRUD Domain Endpoints

The API supports standardized CRUD operations for core travel entities:

- **Destinations:** `/api/destinations`
- **Tour Packages:** `/api/packages`
- **Itineraries:** `/api/itineraries`
- **Hotels:** `/api/hotels`
- **Cabs & Vehicles:** `/api/cabs`
- **Travel Inquiries:** `/api/inquiries`
- **Blogs:** `/api/blogs`
- **Media Assets:** `/api/media`

### Standard Response Structure

- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Operation completed successfully.",
    "data": {}
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "Error description.",
    "code": "ERROR_CODE"
  }
  ```