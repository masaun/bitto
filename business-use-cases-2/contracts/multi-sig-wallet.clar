(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map multi-sig-wallets uint {signers: (list 10 principal), threshold: uint, balance: uint})
(define-data-var multisig-nonce uint u0)

(define-public (create-multisig-wallet (signers (list 10 principal)) (threshold uint))
  (let ((wallet-id (+ (var-get multisig-nonce) u1)))
    (asserts! (<= threshold (len signers)) ERR-INVALID-PARAMETER)
    (map-set multi-sig-wallets wallet-id {signers: signers, threshold: threshold, balance: u0})
    (var-set multisig-nonce wallet-id)
    (ok wallet-id)))

(define-read-only (get-multisig-wallet (wallet-id uint))
  (ok (map-get? multi-sig-wallets wallet-id)))
