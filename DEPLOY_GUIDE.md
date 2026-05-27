# 🍎 APPLE INDYA MOBILES — v2.0 Deploy Guide

## Architecture Overview

```
Frontend (Vercel - FREE)  →  Backend (Railway - FREE)  →  MongoDB Atlas (FREE 512MB)
```

---

## STEP 1: MongoDB Atlas Setup (5 minutes)

1. Go to **https://cloud.mongodb.com** → Sign up free
2. Create a **Free Cluster** (M0 Sandbox - forever free)
3. Choose region: **Mumbai (ap-south-1)** (fastest for Trichy)
4. **Database Access** → Add User:
   - Username: `apple-indya-admin`
   - Password: (generate strong one, save it!)
   - Role: **Atlas Admin**
5. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`)
6. **Connect** → **Drivers** → Copy the connection string:
   ```
   mongodb+srv://apple-indya-admin:<password>@cluster0.xxxxx.mongodb.net/apple-indya?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

---

## STEP 2: Deploy Backend to Railway (10 minutes)

1. Go to **https://railway.app** → Sign up with GitHub (free)
2. **New Project** → **Deploy from GitHub repo**
3. Select your repo → Set **Root Directory** to `/backend`
4. Add **Environment Variables**:
   ```
   MONGODB_URI = mongodb+srv://apple-indya-admin:yourpassword@cluster0.xxxxx.mongodb.net/apple-indya?retryWrites=true&w=majority
   PORT = 5000
   FRONTEND_URL = https://your-app.vercel.app
   ```
5. Railway will auto-detect Node.js and deploy
6. Go to **Settings** → **Domains** → Generate domain
   - You'll get: `https://apple-indya-backend-xxxx.up.railway.app`
   - Copy this URL!

### Seed Initial Data (run once)
After backend deploys, open Railway's Shell/Terminal:
```bash
node seed.js
```
This adds all your existing products to MongoDB.

---

## STEP 3: Deploy Frontend to Vercel (5 minutes)

1. Go to **https://vercel.com** → Sign up with GitHub
2. **New Project** → Import your repo
3. Set **Root Directory** to `/frontend`
4. Add **Environment Variable**:
   ```
   REACT_APP_API_URL = https://apple-indya-backend-xxxx.up.railway.app
   ```
   (Use your Railway URL from Step 2)
5. Click **Deploy**
6. You'll get: `https://apple-indya-mobiles.vercel.app`

### Update Backend CORS
Go back to Railway → update env variable:
```
FRONTEND_URL = https://apple-indya-mobiles.vercel.app
```
Redeploy.

---

## STEP 4: Share with Client

Send your client this URL:
```
https://apple-indya-mobiles.vercel.app
```

That's it! Fully online, permanent data, free hosting.

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Sandbox | **FREE** (512MB) |
| Railway | Hobby | **FREE** ($5 credit/month) |
| Vercel | Hobby | **FREE** (unlimited) |
| **Total** | | **₹0/month** |

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env
# Fill in MONGODB_URI
npm install
npm run dev   # runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000" > .env
npm install
npm start     # runs on http://localhost:3000
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/inventory` | Get all products |
| POST | `/api/inventory` | Add new product |
| PUT | `/api/inventory/:id` | Edit product |
| PATCH | `/api/inventory/:id/restock` | Add stock |
| DELETE | `/api/inventory/:id` | Delete product |
| POST | `/api/sales` | Process sale & generate bill |
| GET | `/api/bills` | Get all bills |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/health` | Check server status |

---

## Folder Structure

```
apple-indya-v2/
├── backend/
│   ├── server.js          ← Express app entry
│   ├── models.js          ← MongoDB schemas
│   ├── seed.js            ← Seed initial data (run once)
│   ├── .env.example       ← Copy to .env
│   ├── package.json
│   └── routes/
│       ├── inventory.js
│       ├── sales.js
│       ├── bills.js
│       └── dashboard.js
└── frontend/
    ├── src/
    │   ├── api.js          ← Uses REACT_APP_API_URL
    │   ├── App.js
    │   ├── pages/
    │   └── components/
    └── package.json
```
