import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      pages: path.resolve(__dirname, 'src/pages'),
      libs: path.resolve(__dirname, 'src/libs'),
      types: path.resolve(__dirname, 'src/types'),
      data: path.resolve(__dirname, 'data'),
      services: path.resolve(__dirname, 'src/services'),
      theme: path.resolve(__dirname, 'src/theme')
    }
  },
  base: '/grab-traffic-website-project/frontend/',
  plugins: [react()]
})
