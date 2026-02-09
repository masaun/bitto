(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map retirements uint {model-id: uint, reason: (string-ascii 128), timestamp: uint, archived: bool})
(define-data-var retirement-nonce uint u0)

(define-public (retire-model (model-id uint) (reason (string-ascii 128)))
  (let ((retirement-id (+ (var-get retirement-nonce) u1)))
    (map-set retirements retirement-id {model-id: model-id, reason: reason, timestamp: stacks-block-height, archived: false})
    (var-set retirement-nonce retirement-id)
    (ok retirement-id)))

(define-read-only (get-retirement (retirement-id uint))
  (ok (map-get? retirements retirement-id)))
