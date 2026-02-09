(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map sandbox-environments uint {owner: principal, config-hash: (buff 32), active: bool})
(define-data-var sandbox-nonce uint u0)

(define-public (create-sandbox (config-hash (buff 32)))
  (let ((sandbox-id (+ (var-get sandbox-nonce) u1)))
    (map-set sandbox-environments sandbox-id {owner: tx-sender, config-hash: config-hash, active: true})
    (var-set sandbox-nonce sandbox-id)
    (ok sandbox-id)))

(define-read-only (get-sandbox (sandbox-id uint))
  (ok (map-get? sandbox-environments sandbox-id)))
