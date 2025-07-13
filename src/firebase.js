import { initializeApp } from 'firebase/app';
import { getFirestore, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJgC-7V3unfGEwpPeGj5blxlLtH9Nucsc",
    authDomain: "choice-wheel.firebaseapp.com",
    projectId: "choice-wheel",
    storageBucket: "choice-wheel.firebasestorage.app",
    messagingSenderId: "629848476777",
    appId: "1:629848476777:web:2422626f727f361a2026f8",
    measurementId: "G-7RQQTELS6D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Collection references
export const optionsCollection = collection(db, 'rouletteOptions');

// Query for options ordered by timestamp
export const optionsQuery = query(optionsCollection, orderBy('timestamp', 'desc'));

export { serverTimestamp };
