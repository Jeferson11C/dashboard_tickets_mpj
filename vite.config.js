import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vue';
            if (id.includes('primevue')) return 'primevue';
            if (id.includes('@fortawesome')) return 'fortawesome';
            return 'vendor'; // Otras dependencias
          }
        },
      },
    },
    chunkSizeWarningLimit: 2000, // Cambia el límite si solo quieres ocultar la advertencia
  },
  optimizeDeps: {
    include: ['vue', 'primevue', '@fortawesome'],
  },
});