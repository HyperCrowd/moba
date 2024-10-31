import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"
import solid from 'vite-plugin-solid'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [solid(), viteSingleFile()],
  define: {
    'import.meta.env.LOG_LEVEL': JSON.stringify(process.env.LOG_LEVEL)
  },
  server: {
    port: 5173
  }
})
