(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map escalations uint {issue-id: uint, level: uint, assignee: principal, resolved: bool})
(define-data-var escalation-nonce uint u0)

(define-public (escalate-issue (issue-id uint) (level uint) (assignee principal))
  (let ((esc-id (+ (var-get escalation-nonce) u1)))
    (asserts! (<= level u5) ERR-INVALID-PARAMETER)
    (map-set escalations esc-id {issue-id: issue-id, level: level, assignee: assignee, resolved: false})
    (var-set escalation-nonce esc-id)
    (ok esc-id)))

(define-read-only (get-escalation (esc-id uint))
  (ok (map-get? escalations esc-id)))
