import * as path from 'path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        nested: path.resolve(__dirname, 'nested/index.html'),
      },
    },
  },
  plugins: [
    vue({
      reactivityTransform: true,
    }),
  ],
})
