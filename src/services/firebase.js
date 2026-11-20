import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuração do Firebase utilizando variáveis de ambiente do Vite
// (com fallback seguro para desenvolvimento local caso o arquivo .env não exista)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyLocalDevKey000000000000000",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "legacyquiz-4cb49.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "legacyquiz-4cb49",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "legacyquiz-4cb49.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== "your_api_key_here"
);

// Inicialização da instância do Firebase
const app = initializeApp(firebaseConfig);

// Inicialização dos serviços necessários
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = isFirebaseConfigured ? getAuth(app) : null;

// Inicialização opcional do Analytics apenas se configurado e suportado no navegador
export let analytics = null;
if (typeof window !== "undefined" && isFirebaseConfigured) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export default app;
