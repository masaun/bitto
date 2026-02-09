(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map decisions uint {agent: principal, proof-hash: (buff 32), block: uint, verified: bool})
(define-data-var decision-nonce uint u0)

(define-public (submit-proof (proof-hash (buff 32)))
  (let ((decision-id (+ (var-get decision-nonce) u1)))
    (map-set decisions decision-id {agent: tx-sender, proof-hash: proof-hash, block: stacks-block-height, verified: false})
    (var-set decision-nonce decision-id)
    (ok decision-id)))

(define-public (verify-proof (decision-id uint))
  (let ((decision (unwrap! (map-get? decisions decision-id) ERR-NOT-FOUND)))
    (ok (map-set decisions decision-id (merge decision {verified: true})))))

(define-read-only (get-decision (decision-id uint))
  (ok (map-get? decisions decision-id)))
