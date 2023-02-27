import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDYfS0kCfH836DCdXHpecQQeaFIwaGFYIA",
  authDomain: "infinit-e18e1.firebaseapp.com",
  projectId: "infinit-e18e1",
  storageBucket: "infinit-e18e1.appspot.com",
  messagingSenderId: "836376971625",
  appId: "1:836376971625:web:5d638a11289ba486f915f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const dataBase = getFirestore(app);
//export const auth = getAuth(app);
export const auth = initializeAuth(app, {
 persistence: [
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserSessionPersistence
  ],
});