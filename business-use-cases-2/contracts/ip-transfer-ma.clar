(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ip-transfers uint {transaction-id: uint, ip-type: (string-ascii 64), transferred: bool})
(define-data-var ip-transfer-nonce uint u0)

(define-public (register-ip-transfer (transaction-id uint) (ip-type (string-ascii 64)))
  (let ((transfer-id (+ (var-get ip-transfer-nonce) u1)))
    (map-set ip-transfers transfer-id {transaction-id: transaction-id, ip-type: ip-type, transferred: false})
    (var-set ip-transfer-nonce transfer-id)
    (ok transfer-id)))

(define-read-only (get-ip-transfer (transfer-id uint))
  (ok (map-get? ip-transfers transfer-id)))
