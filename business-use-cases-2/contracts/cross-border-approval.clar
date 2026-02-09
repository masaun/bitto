(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map cross-border-approvals uint {transfer-id: uint, approver: principal, approved: bool, timestamp: uint})
(define-data-var cb-approval-nonce uint u0)

(define-public (approve-cross-border-transfer (transfer-id uint) (approved bool))
  (let ((approval-id (+ (var-get cb-approval-nonce) u1)))
    (map-set cross-border-approvals approval-id {transfer-id: transfer-id, approver: tx-sender, approved: approved, timestamp: stacks-block-height})
    (var-set cb-approval-nonce approval-id)
    (ok approval-id)))

(define-read-only (get-cross-border-approval (approval-id uint))
  (ok (map-get? cross-border-approvals approval-id)))
