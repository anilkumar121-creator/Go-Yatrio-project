# GoYatrio Backend API

The backend API is mounted under `/api`.

## Environment

Required for database-backed features:

```env
DATABASE_URL=
JWT_SECRET=
API_PORT=4000
API_CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`JWT_SECRET` must be at least 32 characters. Never commit real secrets.

## Authentication

Admin login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin.dev@goyatrio.local",
  "password": "development-password"
}
```

Successful response:

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-id",
      "name": "GoYatrio Dev Admin",
      "email": "admin.dev@goyatrio.local",
      "role": "ADMIN"
    }
  }
}
```

Use the token for protected write routes:

```http
Authorization: Bearer <token>
```

## Health

```http
GET /api/health
```

Response includes API status and database connectivity status when `DATABASE_URL` is configured.

## Resource Routes

The following resources expose a foundation CRUD shape:

- `/api/destinations`
- `/api/packages`
- `/api/itineraries`
- `/api/hotels`
- `/api/cabs`
- `/api/inquiries`
- `/api/blogs`
- `/api/media`

Common endpoints:

```http
GET /api/<resource>
GET /api/<resource>/:id
POST /api/<resource>
PATCH /api/<resource>/:id
DELETE /api/<resource>/:id
```

Write operations require admin authentication, except `POST /api/inquiries`, which is public for lead capture.

## Example Inquiry

```http
POST /api/inquiries
Content-Type: application/json

{
  "fullName": "Demo Traveler",
  "email": "demo@example.com",
  "phone": "+910000000000",
  "destination": "Kerala",
  "serviceType": "DOMESTIC_TOUR",
  "numberOfTravelers": 2,
  "message": "Development sample inquiry"
}
```

## Validation Errors

Validation errors use a consistent shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "issues": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Notes

- Password hashes are never returned by the API.
- Cloudinary media records store references only, not binary files.
- Delete routes use safe behavior where business data should be retained, such as soft-deactivating destinations, packages, hotels, vehicles, closing inquiries, and unpublishing blogs.
