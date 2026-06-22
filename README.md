# Mini Social Post Application

A full-stack responsive social feed web application (Instagram/Twitter-lite) with a premium dark mode layout matching native mobile app views on desktop and mobile web.

## Tech Stack
- **Frontend:** React.js (Vite) + React Bootstrap for styling (no Tailwind CSS). Includes custom themes, pagination, and optimistic UI updates.
- **Backend:** Node.js + Express API. Includes JWT-based authentication, validation, and Base64-encoded image upload capabilities.
- **Database:** MongoDB + Mongoose ODM (User and Post schemas).
- **Icons:** Lucide React.

---

## Folder Structure
```
/                     → Workspace root
  /backend            → Node/Express API server
  /frontend           → Vite/React application
  /package.json       → Workspace configuration
  /README.md          → Documentation
```

---

## Environment Variables Configuration

### Backend (`/backend/.env`)
Create a `.env` file in the `/backend` folder with the following keys:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_secret_key
```

### Frontend (`/frontend/.env`)
Create a `.env` file in the `/frontend` folder with the following key:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)

### Step 1: Install all dependencies
Run the following command at the workspace root directory:
```bash
npm run install:all
```
*This installs package packages in both `/backend` and `/frontend` folders.*

### Step 2: Start Development Servers
Run the following command at the workspace root directory:
```bash
npm start
```
*This runs both the Express backend server (on port `5000`) and the Vite React frontend server (on port `3000`) concurrently. The browser will open the app automatically.*

---

## API Endpoints Reference

### Authentication (Public)
- **POST** `/api/auth/signup` — Registers a new user. Returns JWT and user credentials.
- **POST** `/api/auth/login` — Verifies user credentials. Returns JWT and user credentials.

### Posts (Protected - Require `Authorization: Bearer <JWT_token>`)
- **POST** `/api/posts` — Creates a new social post. At least one of `text` or `imageUrl` (Base64 string) is required.
- **GET** `/api/posts` — Retrieves posts (paginated at 10 items per page, sorted by newest first, populates username). Supports query parameters `page` and `limit`.
- **POST** `/api/posts/:id/like` — Toggles post like status (adds/removes current user from lists).
- **POST** `/api/posts/:id/comment` — Adds a text comment under a post.

---

## Deployment Strategy

### Database: MongoDB Atlas
1. Create a free shared cluster on MongoDB Atlas.
2. In Database Access, create a user with read/write privileges.
3. In Network Access, whitelist `0.0.0.0/0` (all IPs) to permit cloud platform connections.
4. Copy the connection string and set it as `MONGO_URI`.

### Backend: Render
1. Create a Web Service linked to the repository.
2. Specify Root Directory as `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Under Environment variables, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT=10000` (Render handles port routing)

### Frontend: Vercel / Netlify
1. Create a project linked to the repository.
2. Specify Root Directory as `frontend`.
3. Framework Preset: `Vite` (Vercel automatically detects this).
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Under Environment Variables, add:
   - `VITE_API_URL=https://your-backend-render-url.onrender.com/api`
