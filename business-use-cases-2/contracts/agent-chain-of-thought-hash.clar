(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map thought-chains uint {owner: principal, hash: (buff 32), step-count: uint, verified: bool})
(define-data-var chain-nonce uint u0)

(define-public (record-chain (hash (buff 32)) (step-count uint))
  (let ((chain-id (+ (var-get chain-nonce) u1)))
    (asserts! (> step-count u0) ERR-INVALID-PARAMETER)
    (map-set thought-chains chain-id {owner: tx-sender, hash: hash, step-count: step-count, verified: false})
    (var-set chain-nonce chain-id)
    (ok chain-id)))

(define-public (verify-chain (chain-id uint))
  (let ((chain (unwrap! (map-get? thought-chains chain-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner chain) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set thought-chains chain-id (merge chain {verified: true})))))

(define-read-only (get-chain (chain-id uint))
  (ok (map-get? thought-chains chain-id)))
