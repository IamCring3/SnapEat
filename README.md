# SnapEat

A food ordering platform built with React, Firebase, and Express.

## Project Structure

This is a monorepo containing:

- `client/`: React frontend built with Vite
- `admin/`: Express API server for admin operations

## Deployment to Vercel

This project is deployed as two separate Vercel projects:
- Frontend: https://www.snapeat247.com
- Admin API: https://admin-lf80b9klm-iamcring3s-projects.vercel.app

### Prerequisites

1. A Vercel account
2. A Firebase project with Firestore, Authentication, and Storage enabled
3. (Optional) A Razorpay account for payment processing

### Environment Variables

The project uses the following Firebase configuration:

```
FIREBASE_API_KEY=AIzaSyBzwVTCkbbzY7disGMLqzwN9_r5znNLzNM
FIREBASE_AUTH_DOMAIN=snapeat-2288d.firebaseapp.com
FIREBASE_DATABASE_URL=https://snapeat-2288d-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=snapeat-2288d
FIREBASE_STORAGE_BUCKET=snapeat-2288d.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=567797575571
FIREBASE_APP_ID=1:567797575571:web:b44e2b034dc0a7fd510266
FIREBASE_MEASUREMENT_ID=G-C3YVWELGN6
```

### Deployment Steps

#### Client Deployment

1. **Deploy the client to Vercel**:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Vite
     - Root Directory: `client/`
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. **Add Environment Variables for the client**:
   - Add all the Firebase configuration variables with the `VITE_` prefix
   - Add `VITE_API_URL=https://admin-lf80b9klm-iamcring3s-projects.vercel.app`

3. **Set up custom domain**:
   - Configure `snapeat247.com` and `www.snapeat247.com` as custom domains

#### Admin API Deployment

1. **Deploy the admin API to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click "Add New" > "Project"
   - Import the same GitHub repository
   - Configure the project:
     - Framework Preset: Node.js
     - Root Directory: `admin/`
     - Build Command: `npm run vercel-build` (or leave empty)
     - Output Directory: (leave empty)
     - Install Command: `npm install`

2. **Add Environment Variables for the admin**:
   - Add all the Firebase configuration variables
   - Add `FRONTEND_URL=https://www.snapeat247.com`
   - Add Razorpay credentials if using payment processing

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env` files in both `client/` and `admin/` directories based on the `.env.example` files
4. Start the development servers:
   ```
   # Start client
   npm run dev:client

   # Start admin server
   npm run dev:admin
   ```

## Creating an Admin User

To create an admin user:
```
npm run create-admin
```

## Notes

- The frontend is served from the `/` route
- The API is served from the `/api` route
- All API routes are defined in the `admin/routes` directory
