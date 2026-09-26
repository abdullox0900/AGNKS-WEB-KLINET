import { fileURLToPath, URL } from 'node:url'
import { existsSync, readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// HTTPS is required so phones can grant camera access when opening the dev
// server over LAN (https://<lan-ip>:5173) — browsers hide navigator.mediaDevices
// entirely on insecure origins other than localhost. Certificate is self-signed
// and includes the dev machine's LAN IP as a SAN entry (regenerate with the
// openssl command below if your LAN IP changes); the phone browser needs a
// one-time "proceed anyway" past the warning page.
//   openssl req -x509 -newkey rsa:2048 -nodes -keyout certs/dev-key.pem \
//     -out certs/dev-cert.pem -days 365 -subj "/CN=agnks-dev" \
//     -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:<your-lan-ip>"
const certPath = fileURLToPath(new URL('./certs/dev-cert.pem', import.meta.url))
const keyPath = fileURLToPath(new URL('./certs/dev-key.pem', import.meta.url))
const hasCerts = existsSync(certPath) && existsSync(keyPath)
const httpsOptions = hasCerts ? { cert: readFileSync(certPath), key: readFileSync(keyPath) } : undefined

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    https: httpsOptions,
  },
})
