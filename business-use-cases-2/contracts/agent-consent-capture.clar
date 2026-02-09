(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map consent-captures uint {user: principal, consent-type: (string-ascii 64), granted: bool, timestamp: uint})
(define-data-var consent-nonce uint u0)

(define-public (capture-consent (consent-type (string-ascii 64)) (granted bool))
  (let ((consent-id (+ (var-get consent-nonce) u1)))
    (map-set consent-captures consent-id {user: tx-sender, consent-type: consent-type, granted: granted, timestamp: stacks-block-height})
    (var-set consent-nonce consent-id)
    (ok consent-id)))

(define-read-only (get-consent (consent-id uint))
  (ok (map-get? consent-captures consent-id)))
