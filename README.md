# Paintshop

A comprehensive paint shop management system consisting of three main components:

1. **Backend**: Node/Express + MongoDB + Socket.IO server
2. **Painter App**: React Native (Expo) mobile application for painters
3. **Admin App**: React Native (Expo) mobile application for administrators

## Project Structure

```
paintshop/
├── backend/       # Node.js server with Express, MongoDB & Socket.IO
├── painter-app/   # React Native mobile app for painters
└── admin-app/     # React Native mobile app for administrators
```

## Technology Stack

- **Backend**: Node.js, Express, MongoDB, Socket.IO
- **Mobile Apps**: React Native with Expo
- **Database**: MongoDB Atlas (Production)
- **Deployment**: Render (Backend)

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file with required environment variables (see `.env.example`). Set at least `MONGO_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`.
3. Verify health endpoint (requires Node installed):
   ```bash
   curl http://localhost:4000/health
   ```
4. Run the development server:
   ```bash
   npm start
   ```

### Painter App & Admin App

1. Navigate to the respective app directory:
   ```bash
   cd painter-app  # or cd admin-app
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

### Docker Deployment (Local or Render)

1. Build the Docker image:
   ```bash
   docker build -t kbhardware-backend .
   ```
2. Run the container:
   ```bash
   docker run -p 4000:4000 --env-file .env kbhardware-backend
   ```

### Deploying to Render.com

1. In Render, create a new **Web Service** and connect your repository.
2. Set the following environment variables in Render:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `TWILIO_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_SERVICE_SID`
   - `PORT` (default: 4000)
   - `FRONTEND_URL` (if needed)
3. Render will auto-detect the Dockerfile and build the service.
4. On deploy, your backend will be available at the Render-provided URL.

#### Example `render.yaml` (optional)

You may add a `render.yaml` in the backend folder for infrastructure-as-code:

```yaml
services:
  - type: web
    name: kbhardware-backend
    env: docker
    plan: starter
    region: oregon
    branch: main
    dockerfilePath: Dockerfile
    envVars:
      - key: MONGO_URI
        value: <your-mongo-uri>
      - key: JWT_SECRET
        value: <your-jwt-secret>
      - key: TWILIO_SID
        value: <your-twilio-sid>
      - key: TWILIO_AUTH_TOKEN
        value: <your-twilio-auth-token>
      - key: TWILIO_SERVICE_SID
        value: <your-twilio-service-sid>
      - key: PORT
        value: 4000
      - key: FRONTEND_URL
        value: http://localhost:19006
```

## Key Endpoints

- POST `/auth/request-otp` { phone }
- POST `/auth/verify-otp` { phone, otp }
- POST `/admin/login` { email, password }
- GET `/admin/painters?status=pending|approved`
- PATCH `/admin/painters/:id/approve`
- PATCH `/admin/painters/:id/reject`
- PATCH `/admin/painters/:id/remove`
- POST `/admin/offers`
- DELETE `/admin/offers/:id`
- POST `/admin/commissions` { painterId, amount, offerId? }
- GET `/painters/leaderboard?limit=20`
- GET `/painters/me`
- GET `/painters/offers`
- GET `/painters/transactions`

## Development Notes

- Use Expo for building and deploying React Native applications
- MongoDB Atlas is used for production database
- Backend is deployed on Render
- Each workspace has its own package.json and dependencies

## Deployment

Deploy backend on Render with env vars: `MONGO_URI`, `JWT_SECRET`, `TWILIO_*`, `PORT`, `FRONTEND_URL`.
