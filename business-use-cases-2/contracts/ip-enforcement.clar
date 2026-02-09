(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map enforcement-actions uint {ip-id: uint, action-type: (string-ascii 64), target: principal, timestamp: uint})
(define-data-var enforcement-nonce uint u0)

(define-public (take-enforcement-action (ip-id uint) (action-type (string-ascii 64)) (target principal))
  (let ((action-id (+ (var-get enforcement-nonce) u1)))
    (map-set enforcement-actions action-id {ip-id: ip-id, action-type: action-type, target: target, timestamp: stacks-block-height})
    (var-set enforcement-nonce action-id)
    (ok action-id)))

(define-read-only (get-enforcement-action (action-id uint))
  (ok (map-get? enforcement-actions action-id)))
