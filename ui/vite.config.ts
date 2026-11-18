import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const proxy = {
  '/api': 'http://127.0.0.1:8080',
  '/uploads': 'http://127.0.0.1:8080',
};

function readableClassName(className: string, filePath: string) {
  const fileName = filePath.split(/[\\/]/).pop() ?? '';
  const componentName = fileName.replace(/\.module\.css(\?.*)?$/, '');
  return `${componentName}__${className}`;
}

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      generateScopedName: readableClassName,
    },
  },
  server: { proxy },
  preview: { proxy },
});
