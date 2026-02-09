(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map leakage-events uint {prompt-id: uint, type: (string-ascii 64), severity: uint, timestamp: uint})
(define-data-var event-nonce uint u0)

(define-public (log-leakage (prompt-id uint) (type (string-ascii 64)) (severity uint))
  (let ((event-id (+ (var-get event-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set leakage-events event-id {prompt-id: prompt-id, type: type, severity: severity, timestamp: stacks-block-height})
    (var-set event-nonce event-id)
    (ok event-id)))

(define-read-only (get-leakage-event (event-id uint))
  (ok (map-get? leakage-events event-id)))
