(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ethics-reviews uint {subject: (string-ascii 128), reviewer: principal, approved: bool, timestamp: uint})
(define-data-var ethics-review-nonce uint u0)

(define-public (conduct-ethics-review (subject (string-ascii 128)) (approved bool))
  (let ((review-id (+ (var-get ethics-review-nonce) u1)))
    (map-set ethics-reviews review-id {subject: subject, reviewer: tx-sender, approved: approved, timestamp: stacks-block-height})
    (var-set ethics-review-nonce review-id)
    (ok review-id)))

(define-read-only (get-ethics-review (review-id uint))
  (ok (map-get? ethics-reviews review-id)))
