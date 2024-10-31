/// <reference types="vite/client" />

interface ImportMetaEnv {
  LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}