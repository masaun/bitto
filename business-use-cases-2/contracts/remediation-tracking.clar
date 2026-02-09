(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map remediation-plans uint {audit-id: uint, action-items: (string-ascii 256), deadline: uint, completed: bool})
(define-data-var remediation-nonce uint u0)

(define-public (create-remediation-plan (audit-id uint) (action-items (string-ascii 256)) (deadline uint))
  (let ((plan-id (+ (var-get remediation-nonce) u1)))
    (asserts! (> deadline stacks-block-height) ERR-INVALID-PARAMETER)
    (map-set remediation-plans plan-id {audit-id: audit-id, action-items: action-items, deadline: deadline, completed: false})
    (var-set remediation-nonce plan-id)
    (ok plan-id)))

(define-read-only (get-remediation-plan (plan-id uint))
  (ok (map-get? remediation-plans plan-id)))
