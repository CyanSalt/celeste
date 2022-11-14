import * as path from 'path'
import vue from '@vitejs/plugin-vue'
import fastglob from 'fast-glob'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          fastglob.sync('*/index.html', { cwd: __dirname }).map(
            file => [path.dirname(file), path.resolve(__dirname, file)],
          ),
        ),
      },
    },
  },
  plugins: [
    vue({
      reactivityTransform: true,
    }),
  ],
})
