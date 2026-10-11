/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GATEWAY_URL?: string
  readonly VITE_SECURITY_API_URL?: string
  readonly VITE_COMMITTEE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
