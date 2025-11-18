import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- PASO 2: PEGAR TUS CLAVES AQUÍ ---
// Sigue las instrucciones para obtener estos datos desde la consola de Firebase.
// Reemplaza los textos que dicen "PEGAR_..." con los códigos reales.

const firebaseConfig = {
  apiKey: "AIzaSyALWtf9X8SbNCnFupZKf_3o9pXEAvuor-U",
  authDomain: "omniplan-171fd.firebaseapp.com",
  projectId: "omniplan-171fd",
  storageBucket: "omniplan-171fd.firebasestorage.app",
  messagingSenderId: "1000391099190",
  appId: "1:1000391099190:web:20e8f21d69bda78db42997"
};

// Inicializar Firebase de forma segura
const app = initializeApp(firebaseConfig);

// Exportar la base de datos para usarla en App.tsx
export const db = getFirestore(app);