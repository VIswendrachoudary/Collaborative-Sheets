# 🚀 Deployment Guide - Collaborative Sheets

## 📋 Prerequisites

1. **Firebase Project**: Set up at https://console.firebase.google.com
2. **GitHub Repository**: https://github.com/VIswendrachoudary/Collaborative-Sheets
3. **Vercel Account**: https://vercel.com

## 🔧 Environment Variables

Create these environment variables in Vercel:

### Next.js Public Variables
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin SDK (Server-side)
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id
```

## 📦 Deployment Steps

### 1. Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository: `VIswendrachoudary/Collaborative-Sheets`
4. Configure environment variables
5. Click "Deploy"

### 2. Firebase Setup
1. Enable Authentication (Email/Password)
2. Enable Firestore Database
3. Create service account key for Admin SDK
4. Update CORS settings if needed

### 3. Update Share Links
After deployment, update `NEXT_PUBLIC_APP_URL` to your Vercel URL.

## 🎯 Features Deployed

✅ **Formula Engine**: SUM, AVERAGE, COUNT, MIN, MAX, arithmetic
✅ **Real-time Sharing**: Google Sheets-style sharing dialog
✅ **Notifications**: Real-time join notifications
✅ **Responsive Design**: Mobile-friendly interface
✅ **Authentication**: Firebase auth integration
✅ **Document Management**: Create, edit, share spreadsheets

## 🔗 Important URLs

- **Dashboard**: `https://your-app.vercel.app/dashboard`
- **Login**: `https://your-app.vercel.app/login`
- **Shared Documents**: `https://your-app.vercel.app/shared/[shareId]`

## 🐛 Troubleshooting

1. **Build Errors**: Check environment variables
2. **Firebase Issues**: Verify service account credentials
3. **Sharing Not Working**: Update `NEXT_PUBLIC_APP_URL`
4. **Formulas Not Calculating**: Check Firestore rules

## 📱 Post-Deployment

1. Test authentication flow
2. Test formula calculations
3. Test document sharing
4. Test real-time notifications
5. Update CORS settings in Firebase
