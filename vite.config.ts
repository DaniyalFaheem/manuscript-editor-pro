import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/manuscript-editor-pro/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          editor: ['@monaco-editor/react', 'monaco-editor'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          nlp: ['compromise', 'natural'],
        },
      },
    },
  },
})
