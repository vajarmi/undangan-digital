import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// SILAKAN GANTI KODE DI BAWAH INI DENGAN firebaseConfig MILIK ANDA
const firebaseConfig = {
  apiKey: "AIzaSyCQLSmKFp8tcPaRewMoYB5cE9vHVVbPYaY",
  authDomain: "undangansaas-a425d.firebaseapp.com",
  projectId: "undangansaas-a425d",
  storageBucket: "undangansaas-a425d.firebasestorage.app",
  messagingSenderId: "641961443581",
  appId: "1:641961443581:web:357845f84cae704b513e94"
};

// Logika 1 baris yang secara otomatis dikenali tipenya oleh TypeScript
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };