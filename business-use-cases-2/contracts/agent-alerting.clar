(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map alerts uint {agent: principal, severity: uint, message: (string-ascii 256), acknowledged: bool})
(define-data-var alert-nonce uint u0)

(define-public (create-alert (severity uint) (message (string-ascii 256)))
  (let ((alert-id (+ (var-get alert-nonce) u1)))
    (asserts! (<= severity u5) ERR-INVALID-PARAMETER)
    (map-set alerts alert-id {agent: tx-sender, severity: severity, message: message, acknowledged: false})
    (var-set alert-nonce alert-id)
    (ok alert-id)))

(define-read-only (get-alert (alert-id uint))
  (ok (map-get? alerts alert-id)))
