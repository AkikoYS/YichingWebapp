// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAbRq3f8aIV4jT85w9QQEjHqGl1J2qYHKo",
    authDomain: "yichingapp-a5f90.firebaseapp.com",
    projectId: "yichingapp-a5f90",
    storageBucket: "yichingapp-a5f90.firebasestorage.app",
    messagingSenderId: "294471771058",
    appId: "1:294471771058:web:b7baf7525c131a39cbbaab",
    measurementId: "G-3PM8FFGK1V"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Firebase初期化完了を通知する Promise
const firebaseReady = signInAnonymously(auth)
    .then(() => {
        console.log("✅ 匿名ログイン成功");
    })
    .catch((error) => {
        console.error("❌ 匿名ログイン失敗:", error);
    });

export { auth, db, firebaseReady };
