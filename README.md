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

2. Create a `.env` file with required environment variables
3. Run the development server:
   ```bash
   npm run dev
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

## Development Notes

- Use Expo for building and deploying React Native applications
- MongoDB Atlas is used for production database
- Backend is deployed on Render
- Each workspace has its own package.json and dependencies
