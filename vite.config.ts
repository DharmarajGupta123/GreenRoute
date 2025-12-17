// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define: {
//     // This allows the client to access the API key safely during the demo
//     'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
//   }
// });
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // @ts-expect-error process is defined in build environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
