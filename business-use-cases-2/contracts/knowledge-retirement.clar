(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map retired-knowledge uint {kb-id: uint, reason: (string-ascii 128), retired-at: uint, archived: bool})
(define-data-var retirement-nonce uint u0)

(define-public (retire-knowledge (kb-id uint) (reason (string-ascii 128)))
  (let ((retire-id (+ (var-get retirement-nonce) u1)))
    (map-set retired-knowledge retire-id {kb-id: kb-id, reason: reason, retired-at: stacks-block-height, archived: false})
    (var-set retirement-nonce retire-id)
    (ok retire-id)))

(define-read-only (get-retirement (retire-id uint))
  (ok (map-get? retired-knowledge retire-id)))
