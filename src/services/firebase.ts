import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, inMemoryPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCEfLvy8ws12rfdMpzcUlcAXJGpDjeLtPw",
  authDomain: "arenova-test.firebaseapp.com",
  projectId: "arenova-test",
  storageBucket: "arenova-test.firebasestorage.app",
  messagingSenderId: "144453754365",
  appId: "1:144453754365:web:970dc7d74ac1db01f84d94"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize auth with memory persistence to silence the warning
let auth: any;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence
  });
}

export { auth, app, firebaseConfig };
