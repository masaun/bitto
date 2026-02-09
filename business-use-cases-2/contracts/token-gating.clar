(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map token-gating principal {required-tokens: uint, has-access: bool, verified-at: uint})

(define-public (verify-token-gate (member principal) (required-tokens uint) (has-access bool))
  (ok (map-set token-gating member {required-tokens: required-tokens, has-access: has-access, verified-at: stacks-block-height})))

(define-read-only (get-token-gate-status (member principal))
  (ok (map-get? token-gating member)))
