/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NFT_WITH_STATE_FINGERPRINT_CONTRACT_ADDRESS: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
