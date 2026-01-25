import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAUobzGhb_tqFOGoNKMyIAFmpNxTHK0AYc",
  authDomain: "cantinadelcharro.firebaseapp.com",
  databaseURL: "https://cantinadelcharro-default-rtdb.firebaseio.com/",
  projectId: "cantinadelcharro",
  storageBucket: "cantinadelcharro.firebasestorage.app",
  messagingSenderId: "981284006966",
  appId: "1:981284006966:web:31295364d9d1967dabbc97",
  measurementId: "G-FBWVXDR9DB"
};

// Initialize Firebase (solo si no existe)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { database, auth, storage };
export default app;