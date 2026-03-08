import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDkUdXvkQ-plrDVpxqvsfEXw_oHLkmRGYc",
  authDomain: "collaborative-spreadshee-fe3d6.firebaseapp.com",
  projectId: "collaborative-spreadshee-fe3d6",
  storageBucket: "collaborative-spreadshee-fe3d6.firebasestorage.app",
  messagingSenderId: "519394999753",
  appId: "1:519394999753:web:4831e9fbf7b42ae73f7c18",
  measurementId: "G-C2QL622L7H"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Only initialize analytics on client side
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    getAnalytics(app);
  }).catch(err => {
    console.warn('Analytics not available:', err);
  });
}
