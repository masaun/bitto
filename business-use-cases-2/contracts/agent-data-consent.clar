(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map consent-records principal {granted: bool, purpose: (string-ascii 128), expiry: uint})

(define-public (grant-consent (purpose (string-ascii 128)) (expiry uint))
  (begin
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set consent-records tx-sender {granted: true, purpose: purpose, expiry: expiry}))))

(define-public (revoke-consent)
  (ok (map-set consent-records tx-sender {granted: false, purpose: "", expiry: u0})))

(define-read-only (get-consent (user principal))
  (ok (map-get? consent-records user)))
