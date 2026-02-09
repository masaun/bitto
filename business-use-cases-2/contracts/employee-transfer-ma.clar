(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map employee-transfers uint {transaction-id: uint, employee: principal, transferred: bool})
(define-data-var employee-transfer-nonce uint u0)

(define-public (transfer-employee (transaction-id uint) (employee principal))
  (let ((transfer-id (+ (var-get employee-transfer-nonce) u1)))
    (map-set employee-transfers transfer-id {transaction-id: transaction-id, employee: employee, transferred: false})
    (var-set employee-transfer-nonce transfer-id)
    (ok transfer-id)))

(define-read-only (get-employee-transfer (transfer-id uint))
  (ok (map-get? employee-transfers transfer-id)))
