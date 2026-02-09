(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map moderation-actions uint {content-hash: (buff 32), action: (string-ascii 32), reason: (string-ascii 128), timestamp: uint})
(define-data-var action-nonce uint u0)

(define-public (moderate-content (content-hash (buff 32)) (action (string-ascii 32)) (reason (string-ascii 128)))
  (let ((action-id (+ (var-get action-nonce) u1)))
    (map-set moderation-actions action-id {content-hash: content-hash, action: action, reason: reason, timestamp: stacks-block-height})
    (var-set action-nonce action-id)
    (ok action-id)))

(define-read-only (get-moderation (action-id uint))
  (ok (map-get? moderation-actions action-id)))
