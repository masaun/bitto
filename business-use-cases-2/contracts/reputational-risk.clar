(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map reputational-risks uint {event-type: (string-ascii 64), severity: uint, public: bool, resolved: bool})
(define-data-var rep-risk-nonce uint u0)

(define-public (log-reputational-risk (event-type (string-ascii 64)) (severity uint) (public bool))
  (let ((risk-id (+ (var-get rep-risk-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set reputational-risks risk-id {event-type: event-type, severity: severity, public: public, resolved: false})
    (var-set rep-risk-nonce risk-id)
    (ok risk-id)))

(define-read-only (get-reputational-risk (risk-id uint))
  (ok (map-get? reputational-risks risk-id)))
