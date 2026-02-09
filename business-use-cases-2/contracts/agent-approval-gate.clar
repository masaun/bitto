(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map approval-gates uint {request-id: uint, approver: principal, approved: bool, timestamp: uint})
(define-data-var gate-nonce uint u0)

(define-public (request-approval (request-id uint) (approver principal))
  (let ((gate-id (+ (var-get gate-nonce) u1)))
    (map-set approval-gates gate-id {request-id: request-id, approver: approver, approved: false, timestamp: stacks-block-height})
    (var-set gate-nonce gate-id)
    (ok gate-id)))

(define-read-only (get-approval-gate (gate-id uint))
  (ok (map-get? approval-gates gate-id)))
