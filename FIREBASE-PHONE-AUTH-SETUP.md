# Firebase Phone Authentication Setup Guide

## Firebase Console Configuration

To ensure phone authentication works properly, follow these steps in the Firebase Console:

### 1. Enable Phone Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (snapeat-2288d)
3. Go to Authentication > Sign-in methods
4. Make sure "Phone" is enabled as a sign-in provider
5. Click "Save"

### 2. Add Test Phone Numbers (for Test Mode)

1. In the Phone provider settings, find "Phone numbers for testing"
2. Add your phone number in E.164 format (e.g., +919876543210)
3. Click "Save"

### 3. Enable Billing

Firebase Phone Authentication requires billing to be enabled:

1. Go to Project settings > Usage and billing
2. Click "Modify plan" and select "Blaze" (pay as you go) plan
3. Add a payment method if not already added
4. Complete the billing setup

### 4. Add Authorized Domains

1. Go to Authentication > Settings
2. Under "Authorized domains", add:
   - www.snapeat247.com
   - snapeat247.com
   - admin-lf80b9klm-iamcring3s-projects.vercel.app
   - localhost (for local testing)
3. Click "Save"

### 5. Configure App Verification

For production apps, you need to verify your app:

#### For Web:
1. Go to Project settings > General
2. Add your domain to the "Authorized domains" list
3. Make sure your reCAPTCHA site key is properly configured

## Testing Phone Authentication

### Test Mode vs Production Mode

- **Test Mode**: Only works with phone numbers you've explicitly added to the allowlist
- **Production Mode**: Works with real phone numbers but requires proper app verification

### Troubleshooting

If you're still not receiving verification codes:

1. **Check Firebase Console Logs**:
   - Go to Authentication > Users
   - Look for any failed authentication attempts

2. **Check Browser Console**:
   - Open browser developer tools (F12)
   - Look for any errors related to Firebase or reCAPTCHA

3. **Try Different Phone Numbers**:
   - Some phone numbers might be blocked or restricted
   - Try a phone number from a different carrier

4. **Check Network Connectivity**:
   - Make sure your device has stable internet connection
   - Try on a different network (e.g., switch from WiFi to mobile data)

5. **Clear Browser Cache**:
   - Clear cookies and cache
   - Try in an incognito/private browsing window

## Common Error Codes

- **auth/invalid-phone-number**: The phone number format is incorrect
- **auth/invalid-verification-code**: The verification code entered is invalid
- **auth/captcha-check-failed**: The reCAPTCHA verification failed
- **auth/quota-exceeded**: You've exceeded your SMS quota
- **auth/too-many-requests**: Too many requests from the same device

## Firebase Configuration

Make sure your Firebase configuration in the code matches the one in your Firebase project:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBzwVTCkbbzY7disGMLqzwN9_r5znNLzNM",
  authDomain: "snapeat-2288d.firebaseapp.com",
  databaseURL: "https://snapeat-2288d-default-rtdb.firebaseio.com",
  projectId: "snapeat-2288d",
  storageBucket: "snapeat-2288d.firebasestorage.app",
  messagingSenderId: "567797575571",
  appId: "1:567797575571:web:b44e2b034dc0a7fd510266",
  measurementId: "G-C3YVWELGN6"
};
```
