import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const logUserActivity = {
  viewEvent: (eventId: string, eventTitle: string) => {
    console.log('View event:', { eventId, eventTitle, timestamp: new Date().toISOString() });
  },
  shareEvent: (eventId: string, shareMethod: string) => {
    console.log('Share event:', { eventId, shareMethod, timestamp: new Date().toISOString() });
  },
  pageView: (pageName: string) => {
    console.log('Page view:', { pageName, timestamp: new Date().toISOString() });
  },
  memberRegister: (userId: string, userData: { name: string | null; email: string | null; }) => {
    console.log('Member register:', { userId, userData, timestamp: new Date().toISOString() });
  },
  memberLogin: (userId: string, method: string) => {
    console.log('Member login:', { userId, method, timestamp: new Date().toISOString() });
  },
  memberUpdate: (userId: string, updatedFields: string[]) => {
    console.log('Member update:', { userId, updatedFields, timestamp: new Date().toISOString() });
  },
  userInteraction: (action: string, data: any, userId: string) => {
    console.log('User interaction:', { action, data, userId, timestamp: new Date().toISOString() });
  }
};