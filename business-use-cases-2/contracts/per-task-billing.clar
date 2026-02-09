(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map task-charges uint {user: principal, task-id: (string-ascii 64), amount: uint, paid: bool})
(define-data-var charge-nonce uint u0)

(define-public (charge-task (task-id (string-ascii 64)) (amount uint))
  (let ((charge-id (+ (var-get charge-nonce) u1)))
    (asserts! (> amount u0) ERR-INVALID-PARAMETER)
    (map-set task-charges charge-id {user: tx-sender, task-id: task-id, amount: amount, paid: false})
    (var-set charge-nonce charge-id)
    (ok charge-id)))

(define-read-only (get-charge (charge-id uint))
  (ok (map-get? task-charges charge-id)))
