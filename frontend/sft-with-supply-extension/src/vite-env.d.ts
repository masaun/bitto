/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SFT_WITH_SUPPLY_EXTENSION_CONTRACT_ADDRESS: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
