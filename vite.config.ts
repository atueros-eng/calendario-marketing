import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// --- CONFIGURACIÓN SIMPLE ---
// He colocado tu clave aquí para que funcione directo.
const TU_CLAVE_GOOGLE = "AIzaSyDzmH2PpapSfDgk5lz7fNx-Yx7qhuaqOLE";

export default defineConfig({
  plugins: [react()],
  define: {
    // Esto envía la clave al resto de la aplicación
    'process.env.API_KEY': JSON.stringify(TU_CLAVE_GOOGLE)
  }
});