(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map thought-chains uint {owner: principal, hash: (buff 32), step-count: uint, verified: bool})
(define-data-var chain-nonce uint u0)

(define-public (record-chain (hash (buff 32)) (step-count uint))
  (let ((thought-chain-id (+ (var-get chain-nonce) u1)))
    (asserts! (> step-count u0) ERR-INVALID-PARAMETER)
    (map-set thought-chains thought-chain-id {owner: tx-sender, hash: hash, step-count: step-count, verified: false})
    (var-set chain-nonce thought-chain-id)
    (ok thought-chain-id)))

(define-public (verify-chain (thought-chain-id uint))
  (let ((chain (unwrap! (map-get? thought-chains thought-chain-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner chain) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set thought-chains thought-chain-id (merge chain {verified: true})))))

(define-read-only (get-chain (thought-chain-id uint))
  (ok (map-get? thought-chains thought-chain-id)))
