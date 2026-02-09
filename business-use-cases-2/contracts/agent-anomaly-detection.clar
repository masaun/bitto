(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map anomalies uint {agent: principal, anomaly-type: (string-ascii 64), severity: uint, timestamp: uint})
(define-data-var anomaly-nonce uint u0)

(define-public (detect-anomaly (anomaly-type (string-ascii 64)) (severity uint))
  (let ((anomaly-id (+ (var-get anomaly-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set anomalies anomaly-id {agent: tx-sender, anomaly-type: anomaly-type, severity: severity, timestamp: stacks-block-height})
    (var-set anomaly-nonce anomaly-id)
    (ok anomaly-id)))

(define-read-only (get-anomaly (anomaly-id uint))
  (ok (map-get? anomalies anomaly-id)))
