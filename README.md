# SnapEat

A food ordering platform built with React, Firebase, and Express.

## Project Structure

This is a monorepo containing:

- `client/`: React frontend built with Vite
- `admin/`: Express API server for admin operations

## Deployment to Vercel

### Prerequisites

1. A Vercel account
2. A Firebase project with Firestore, Authentication, and Storage enabled
3. (Optional) A Razorpay account for payment processing

### Environment Variables

Before deploying, you need to set up environment variables in Vercel:

#### For the entire project:

- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `FIREBASE_DATABASE_URL`: Your Firebase database URL
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID
- `FIREBASE_PRIVATE_KEY`: Your Firebase admin private key (with quotes)
- `FIREBASE_CLIENT_EMAIL`: Your Firebase admin client email
- `FRONTEND_URL`: The URL of your deployed frontend
- `RAZORPAY_KEY_ID`: Your Razorpay key ID (if using Razorpay)
- `RAZORPAY_KEY_SECRET`: Your Razorpay key secret (if using Razorpay)

### Deployment Steps

1. **Connect your GitHub repository to Vercel**:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Other
     - Root Directory: ./
     - Build Command: npm run build
     - Output Directory: client/dist
     - Install Command: npm install

2. **Add Environment Variables**:
   - In the Vercel project settings, add all the environment variables listed above

3. **Deploy**:
   - Click "Deploy" and wait for the build to complete

4. **Verify Deployment**:
   - Once deployed, visit your Vercel URL to ensure the application is working correctly
   - Test the API endpoints by visiting `https://your-vercel-url.vercel.app/api/products`

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
