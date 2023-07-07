import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

// const firebaseConfig = {
//   apiKey: "AIzaSyDYfS0kCfH836DCdXHpecQQeaFIwaGFYIA",
//   authDomain: "infinit-e18e1.firebaseapp.com",
//   projectId: "infinit-e18e1",
//   storageBucket: "infinit-e18e1.appspot.com",
//   messagingSenderId: "836376971625",
//   appId: "1:836376971625:web:5d638a11289ba486f915f8"
// };

const firebaseConfig = {
  apiKey: "AIzaSyBTdX4CD_rhdN-_XXwEP_aDYMWO8cNDE_s",
  authDomain: "corpbrasilagenda.firebaseapp.com",
  projectId: "corpbrasilagenda",
  storageBucket: "corpbrasilagenda.appspot.com",
  messagingSenderId: "470445723567",
  appId: "1:470445723567:web:b3453da2cf373a8084295a",
  measurementId: "G-0EELZ2KP9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const dataBase = getFirestore(app);
export const auth = initializeAuth(app, { // Melhora a perfomance
 persistence: [
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserSessionPersistence
  ],
});