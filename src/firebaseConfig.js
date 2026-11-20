import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

/**
 * Configuração das credenciais do Firebase (projeto legacyquiz-4cb49)
 * Utiliza variáveis de ambiente do Vite (prefixo VITE_).
 */
export const firebaseConfig = {
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

// Inicialização do app
export const app = initializeApp(firebaseConfig);

// Instâncias dos serviços
export const db = getFirestore(app);
export const storage = getStorage(app);

// Inicialização do Analytics (com verificação de compatibilidade no ambiente)
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
