(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map regulatory-approvals uint {transaction-id: uint, jurisdiction: (string-ascii 32), approved: bool})
(define-data-var reg-approval-nonce uint u0)

(define-public (request-regulatory-approval (transaction-id uint) (jurisdiction (string-ascii 32)))
  (let ((approval-id (+ (var-get reg-approval-nonce) u1)))
    (map-set regulatory-approvals approval-id {transaction-id: transaction-id, jurisdiction: jurisdiction, approved: false})
    (var-set reg-approval-nonce approval-id)
    (ok approval-id)))

(define-read-only (get-regulatory-approval (approval-id uint))
  (ok (map-get? regulatory-approvals approval-id)))
