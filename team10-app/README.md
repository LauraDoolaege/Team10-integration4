# Team10 App

Clean React Router + Express setup for trip voting application.

## Setup

```bash
npm install
```

## Development

```bash
npm run server:dev     # Start Express server on port 443
npm run client         # Start Vite dev server on port 5173 (in another terminal)
npm run dev            # Run both concurrently
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:443/api
- **Health check**: http://localhost:443/api/health

## Build

```bash
npm run client:build   # Build frontend for production
npm run client:preview # Preview production build locally
```

## Project Structure

- **app/**: React frontend with Router
  - `routes/` - Page components with loaders
  - `components/` - Reusable React components
  - `services/` - API and Socket.IO client
  - `styles/` - Global and component styles
  - `root.jsx` - Root layout with navigation
  - `entry.client.jsx` - React Router setup

- **server/**: Express backend with Socket.IO
  - `routes/` - API endpoints (trips, cafes)
  - `services/` - Business logic and DB operations
  - `socket/` - Socket.IO event handlers
  - `db/` - JSON data files (trips.json, cafes.json)
  - `certs/` - SSL certificates

- **shared/**: Shared code between frontend and backend
  - `constants.js` - API URLs, enum values
  - `types.js` - Type definitions and JSDoc

## Next Steps

1. **Generate SSL certs in `server/certs/`**:
   ```bash
   cd server
   openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"
   ```

2. **Create `server/.env` from `.env.example`**:
   ```bash
   cp server/.env.example server/.env
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

## Business Logic Placement

- **API endpoints**: `server/routes/` - Add POST/PUT/DELETE routes
- **Database operations**: `server/services/` - Extend trip/cafe services
- **Real-time events**: `server/socket/handlers.js` - Add Socket.IO listeners
- **Frontend pages**: `app/routes/` - Create new page components
- **Frontend components**: `app/components/` - Reusable UI components
- **API calls**: `app/services/api.js` - Add new API methods

## Current Features

- ✓ Express server with HTTPS/HTTP fallback
- ✓ Socket.IO initialized and ready
- ✓ Basic route structure (trips, cafes)
- ✓ JSON file-based database
- ✓ React Router with basic pages
- ✓ API service client setup
- ✓ Socket.IO client ready

## TODO (Not Yet Implemented)

- Trip voting logic
- Email notifications
- Player tracking
- Date voting aggregation
- WebSocket real-time updates
- React component library
- Frontend state management
