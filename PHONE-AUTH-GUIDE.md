# Firebase Phone Authentication Guide

## Overview
This application uses Firebase Phone Authentication to verify users. If you're experiencing issues with phone authentication, please follow this guide.

## Common Issues and Solutions

### 1. "Invalid App Credential" Error
This error typically occurs when Firebase can't verify your reCAPTCHA. Possible solutions:

- **Try a different phone number**: Some phone numbers might be blocked or restricted
- **Use a different browser**: Chrome works best with Firebase
- **Clear browser cache and cookies**
- **Disable VPN or proxy** if you're using one

### 2. "Too Many Requests" Error
This happens when you've made too many verification attempts. Solutions:

- Wait for some time (usually 1 hour) before trying again
- Try a different phone number
- Try from a different device or network

### 3. Billing Issues
If phone authentication suddenly stops working, it might be a billing issue:

- Check if your Firebase project has billing enabled
- Verify that your credit card is valid and not expired
- Check if you've reached your quota for SMS messages

## Firebase Console Settings

To ensure phone authentication works properly, check these settings in the Firebase Console:

1. **Enable Phone Authentication**:
   - Go to Authentication > Sign-in methods
   - Make sure Phone provider is enabled

2. **Authorized Domains**:
   - Go to Authentication > Settings
   - Under "Authorized domains", make sure your domains are listed
   - For local testing, "localhost" should be included

3. **API Key Restrictions**:
   - Go to Project Settings > API keys
   - Check if there are any restrictions on your API key
   - Make sure your domains are allowed

## Phone Number Format

Always use the correct phone number format:
- Include the country code (e.g., +91 for India)
- Format should be: +[country code][phone number]
- Example: +919876543210 for an Indian number

## Contact Support

If you continue to experience issues after trying these solutions, please contact Firebase support or your developer for further assistance.
