import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 1. Initialize Firebase Config
// This safely checks for environment variables (useful for deployment environments) 
// or falls back to standard config you will replace with your own from the Firebase Console.
let firebaseConfig;
if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
} else {
    // ⚠️ Replace these with your actual Firebase project settings
     firebaseConfig = {
  apiKey: "AIzaSyCwmRfLuGdsleV4aoDqhSnfCvxl-myJTsg",
  authDomain: "smart-store-app-644ed.firebaseapp.com",
  projectId: "smart-store-app-644ed",
  storageBucket: "smart-store-app-644ed.firebasestorage.app",
  messagingSenderId: "1068775514635",
  appId: "1:1068775514635:web:3983b8a3d693cfbee41d0e",
  measurementId: "G-0P8XP6HV6G"
};
}

// 2. Initialize Core Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'smart-store-default';

// 3. Initial Authentication Setup (Required for secure Firestore access)
const initAuth = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else if (typeof __initial_auth_token !== 'undefined') {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Auth initialization failed:", error);
    }
};
initAuth();

// Export the initialized services so auth.js and app.js can use them
export { app, auth, db, appId, onAuthStateChanged };