(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map safety-policies principal {harm-prevention: bool, bias-check: bool, content-filter: bool})

(define-public (set-safety-policy (harm-prevention bool) (bias-check bool) (content-filter bool))
  (ok (map-set safety-policies tx-sender {harm-prevention: harm-prevention, bias-check: bias-check, content-filter: content-filter})))

(define-read-only (get-safety-policy (agent principal))
  (ok (map-get? safety-policies agent)))
