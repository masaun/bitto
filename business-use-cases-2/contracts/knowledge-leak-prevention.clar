(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map leak-events uint {kb-id: uint, severity: uint, detected-at: uint, mitigated: bool})
(define-data-var leak-nonce uint u0)

(define-public (log-leak-event (kb-id uint) (severity uint))
  (let ((leak-id (+ (var-get leak-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set leak-events leak-id {kb-id: kb-id, severity: severity, detected-at: stacks-block-height, mitigated: false})
    (var-set leak-nonce leak-id)
    (ok leak-id)))

(define-read-only (get-leak-event (leak-id uint))
  (ok (map-get? leak-events leak-id)))
