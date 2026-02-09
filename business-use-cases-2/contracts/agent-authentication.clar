(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map auth-tokens principal {token-hash: (buff 32), expiry: uint, revoked: bool})

(define-public (issue-token (token-hash (buff 32)) (expiry uint))
  (begin
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set auth-tokens tx-sender {token-hash: token-hash, expiry: expiry, revoked: false}))))

(define-public (revoke-token)
  (let ((token (unwrap! (map-get? auth-tokens tx-sender) ERR-NOT-FOUND)))
    (ok (map-set auth-tokens tx-sender (merge token {revoked: true})))))

(define-read-only (get-token (agent principal))
  (ok (map-get? auth-tokens agent)))
