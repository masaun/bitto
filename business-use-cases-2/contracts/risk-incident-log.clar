(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map risk-incidents uint {risk-id: uint, description: (string-ascii 256), severity: uint, timestamp: uint})
(define-data-var incident-nonce uint u0)

(define-public (log-risk-incident (risk-id uint) (description (string-ascii 256)) (severity uint))
  (let ((incident-id (+ (var-get incident-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set risk-incidents incident-id {risk-id: risk-id, description: description, severity: severity, timestamp: stacks-block-height})
    (var-set incident-nonce incident-id)
    (ok incident-id)))

(define-read-only (get-risk-incident (incident-id uint))
  (ok (map-get? risk-incidents incident-id)))
