(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map emergency-powers principal {granted: bool, scope: (string-ascii 128), expiry: uint})

(define-public (grant-emergency-powers (user principal) (scope (string-ascii 128)) (expiry uint))
  (begin
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set emergency-powers user {granted: true, scope: scope, expiry: expiry}))))

(define-read-only (get-emergency-powers (user principal))
  (ok (map-get? emergency-powers user)))
