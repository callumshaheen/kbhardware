# KBHardware Backend

## Overview
This backend powers the KBHardware paintshop platform. It provides authentication, admin approval, commission management, and leaderboard APIs.

## Environment Variables
Create a `.env` file in `paintshop/backend` with the following variables:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/kbhardware
JWT_SECRET=your_jwt_secret
RENDER_API_KEY=your_render_api_key # (if using Render deploy)
```

## Setup & Run

```bash
cd paintshop/backend
npm install
npm test # Run tests
npm start # Start server
```

## API Usage (Sample Flow)

### 1. Request OTP
```
POST /api/auth/request-otp
{
  "phone": "1234567890"
}
```

### 2. Verify OTP
```
POST /api/auth/verify-otp
{
  "phone": "1234567890",
  "otp": "123456"
}
```

### 3. Admin Approve Painter
```
POST /api/admin/approve
Authorization: Bearer <admin_token>
{
  "painterId": "<id>"
}
```

### 4. Painter Login
```
POST /api/auth/login
{
  "phone": "1234567890",
  "password": "yourpassword"
}
```

### 5. Add Commission
```
POST /api/commission
Authorization: Bearer <painter_token>
{
  "amount": 1000,
  "description": "Paint job"
}
```

## Postman Collection
- Import the above requests into Postman for quick testing.

## Runbook: Deploying
1. Push to `main` branch.
2. GitHub Actions will run tests.
3. (Optional) On success, Render deploy is triggered if configured.

---

## OpenAPI (Critical Endpoints)
See `openapi.yaml` for API documentation.
