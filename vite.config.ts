import { defineConfig } from 'vite';
export default defineConfig({base:'./',build:{rollupOptions:{input:{main:"index.html",gym:"roll-gym.html",hub:"gyms.html"}},chunkSizeWarningLimit:1600}});
