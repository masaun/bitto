(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map audit-trails uint {entity: principal, action: (string-ascii 128), auditor: principal, timestamp: uint})
(define-data-var audit-trail-nonce uint u0)

(define-public (log-audit-trail (entity principal) (action (string-ascii 128)))
  (let ((trail-id (+ (var-get audit-trail-nonce) u1)))
    (map-set audit-trails trail-id {entity: entity, action: action, auditor: tx-sender, timestamp: stacks-block-height})
    (var-set audit-trail-nonce trail-id)
    (ok trail-id)))

(define-read-only (get-audit-trail (trail-id uint))
  (ok (map-get? audit-trails trail-id)))
