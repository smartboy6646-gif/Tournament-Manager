import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
piKey: "AIzaSyCr3KppyletpqOJktE0mD5R5MpLAnvB7Ug",
  authDomain: "tournament-manager-617fe.firebaseapp.com",
  projectId: "tournament-manager-617fe",
  storageBucket: "tournament-manager-617fe.firebasestorage.app",
  messagingSenderId: "17963711048",
  appId: "1:17963711048:web:5136752f3ff9c3453d367d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

export { signInWithEmailAndPassword, onAuthStateChanged, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc };
