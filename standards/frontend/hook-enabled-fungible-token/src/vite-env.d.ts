/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOOK_ENABLED_FUNGIBLE_TOKEN_CONTRACT_ADDRESS: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
