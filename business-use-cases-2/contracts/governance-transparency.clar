(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map transparency-logs uint {event-type: (string-ascii 64), data-hash: (buff 32), timestamp: uint, public: bool})
(define-data-var transparency-nonce uint u0)

(define-public (log-transparency-event (event-type (string-ascii 64)) (data-hash (buff 32)) (public bool))
  (let ((log-id (+ (var-get transparency-nonce) u1)))
    (map-set transparency-logs log-id {event-type: event-type, data-hash: data-hash, timestamp: stacks-block-height, public: public})
    (var-set transparency-nonce log-id)
    (ok log-id)))

(define-read-only (get-transparency-log (log-id uint))
  (ok (map-get? transparency-logs log-id)))
