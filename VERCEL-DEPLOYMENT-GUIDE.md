# SnapEat Vercel Deployment Guide

This guide will help you deploy your SnapEat application to Vercel. The application consists of two parts:
1. Client (React frontend)
2. Admin (Express API server)

## Prerequisites

1. A Vercel account
2. Your GitHub repository with the SnapEat code
3. Firebase project (already configured)
4. Razorpay account (already configured)

## Configuration Files

Your project already has the necessary configuration files for Vercel deployment:

- Root `vercel.json`: For deploying both client and admin
- `client/vercel.json`: For client-specific configuration
- `admin/vercel.json`: For admin-specific configuration

## Environment Variables

### Client Environment Variables

The client uses these environment variables (already in `client/.env`):

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBzwVTCkbbzY7disGMLqzwN9_r5znNLzNM
VITE_FIREBASE_AUTH_DOMAIN=snapeat-2288d.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://snapeat-2288d-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=snapeat-2288d
VITE_FIREBASE_STORAGE_BUCKET=snapeat-2288d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=567797575571
VITE_FIREBASE_APP_ID=1:567797575571:web:b44e2b034dc0a7fd510266
VITE_FIREBASE_MEASUREMENT_ID=G-C3YVWELGN6

# API Configuration
VITE_API_URL=https://admin-lf80b9klm-iamcring3s-projects.vercel.app

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_C9xDgkosiD7b6l
```

### Admin Environment Variables

The admin server uses these environment variables (already in `admin/.env`):

```
# Server Configuration
PORT=8002
NODE_ENV=development

# Frontend URL for CORS and links
FRONTEND_URL=https://www.snapeat247.com

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_C9xDgkosiD7b6l
RAZORPAY_KEY_SECRET=N1AIv5WW7anORvIpuXkuxgIk

# API URL
BASE_URL=https://admin-lf80b9klm-iamcring3s-projects.vercel.app

# Firebase Configuration
FIREBASE_API_KEY=AIzaSyBzwVTCkbbzY7disGMLqzwN9_r5znNLzNM
FIREBASE_AUTH_DOMAIN=snapeat-2288d.firebaseapp.com
FIREBASE_DATABASE_URL=https://snapeat-2288d-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=snapeat-2288d
FIREBASE_STORAGE_BUCKET=snapeat-2288d.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=567797575571
FIREBASE_APP_ID=1:567797575571:web:b44e2b034dc0a7fd510266
FIREBASE_MEASUREMENT_ID=G-C3YVWELGN6
```

## Deployment Steps

### Option 1: Deploy as a Single Project (Recommended)

This approach uses the root `vercel.json` to deploy both the client and admin as a single project.

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Other
     - Root Directory: (leave empty to use the root directory)
     - Build Command: (leave empty to use the one in vercel.json)
     - Output Directory: (leave empty to use the one in vercel.json)
     - Install Command: `npm install`

3. **Add Environment Variables**:
   - Add all the environment variables from both `client/.env` and `admin/.env`
   - Make sure to set `NODE_ENV=production` for the admin server

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete

5. **Set up custom domain** (optional):
   - Go to the project settings
   - Click on "Domains"
   - Add your domain (e.g., snapeat247.com)

### Option 2: Deploy as Separate Projects

Alternatively, you can deploy the client and admin as separate Vercel projects.

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
   - Add all the environment variables from `client/.env`
   - Make sure `VITE_API_URL` points to your admin API URL

3. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete

4. **Set up custom domain** (optional):
   - Go to the project settings
   - Click on "Domains"
   - Add your domain (e.g., snapeat247.com)

#### Admin API Deployment

1. **Deploy the admin API to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click "Add New" > "Project"
   - Import the same GitHub repository
   - Configure the project:
     - Framework Preset: Node.js
     - Root Directory: `admin/`
     - Build Command: (leave empty)
     - Output Directory: (leave empty)
     - Install Command: `npm install`

2. **Add Environment Variables for the admin**:
   - Add all the environment variables from `admin/.env`
   - Make sure to set `NODE_ENV=production`
   - Update `FRONTEND_URL` to point to your client URL

3. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete

4. **Set up custom domain** (optional):
   - Go to the project settings
   - Click on "Domains"
   - Add your domain (e.g., api.snapeat247.com)

## Post-Deployment Steps

1. **Update the client's API URL**:
   - If you deployed the admin API to a different URL than what's in your `client/.env`, update the `VITE_API_URL` environment variable in the Vercel project settings.

2. **Test the application**:
   - Visit your deployed client URL
   - Test the authentication
   - Test the product listing
   - Test the checkout process with Razorpay
   - Test the Cash on Delivery option

3. **Monitor for errors**:
   - Check the Vercel logs for any deployment or runtime errors
   - Fix any issues and redeploy if necessary

## Troubleshooting

### CORS Issues

If you encounter CORS issues:
1. Check that the `FRONTEND_URL` in the admin environment variables matches your client URL
2. Verify that the admin's CORS configuration includes your client domain
3. Make sure your client is using the correct API URL

### Razorpay Issues

If Razorpay integration doesn't work:
1. Verify that the Razorpay keys are correctly set in both client and admin environment variables
2. Check the browser console for any JavaScript errors
3. Check the admin server logs for API errors

### Firebase Issues

If Firebase integration doesn't work:
1. Verify that all Firebase environment variables are correctly set
2. Check that your Firebase project has the necessary services enabled (Authentication, Firestore, Storage)
3. Verify that your Firebase security rules allow the necessary operations

## Conclusion

Your SnapEat application should now be successfully deployed to Vercel. If you encounter any issues, check the Vercel logs and make the necessary adjustments to your configuration.
