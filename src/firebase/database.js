import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBOqV_g3jydOQo5txeF1-M65SUGYDZydKw",
  authDomain: "corpbrasilafiliados.firebaseapp.com",
  projectId: "corpbrasilafiliados",
  storageBucket: "corpbrasilafiliados.appspot.com",
  messagingSenderId: "687207757977",
  appId: "1:687207757977:web:ddc03011ce5048e4f32008"
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