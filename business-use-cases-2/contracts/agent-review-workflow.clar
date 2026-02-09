(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map review-workflows uint {item-id: uint, reviewer: principal, status: (string-ascii 20), completed: bool})
(define-data-var workflow-nonce uint u0)

(define-public (create-review (item-id uint) (reviewer principal))
  (let ((workflow-id (+ (var-get workflow-nonce) u1)))
    (map-set review-workflows workflow-id {item-id: item-id, reviewer: reviewer, status: "pending", completed: false})
    (var-set workflow-nonce workflow-id)
    (ok workflow-id)))

(define-read-only (get-review-workflow (workflow-id uint))
  (ok (map-get? review-workflows workflow-id)))
