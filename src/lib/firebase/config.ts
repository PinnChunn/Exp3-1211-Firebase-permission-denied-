import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC16ekl_0eR4RarphTPMXt64bHQZrgrWkk",
  authDomain: "exp32024.firebaseapp.com",
  projectId: "exp32024",
  storageBucket: "exp32024.appspot.com",
  messagingSenderId: "581668076921",
  appId: "1:581668076921:web:9b08c9b3f64ef43a3083a8",
  measurementId: "G-NNQ94XM1CT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Enable offline persistence with error handling
try {
  enableIndexedDbPersistence(db, {
    synchronizeTabs: true
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (err) {
  console.warn('Error enabling persistence:', err);
}

// Use emulators in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (err) {
    console.warn('Error connecting to emulators:', err);
  }
}

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { db, auth, googleProvider };