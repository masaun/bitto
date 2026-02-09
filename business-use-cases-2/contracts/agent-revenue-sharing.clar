(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map revenue-shares {agent-id: uint, recipient: principal} {percentage: uint, total-earned: uint})

(define-public (set-revenue-share (agent-id uint) (recipient principal) (percentage uint))
  (begin
    (asserts! (<= percentage u100) ERR-INVALID-PARAMETER)
    (ok (map-set revenue-shares {agent-id: agent-id, recipient: recipient} {percentage: percentage, total-earned: u0}))))

(define-read-only (get-revenue-share (agent-id uint) (recipient principal))
  (ok (map-get? revenue-shares {agent-id: agent-id, recipient: recipient})))
