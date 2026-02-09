(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map risk-entries uint {risk-type: (string-ascii 64), severity: uint, probability: uint, mitigated: bool})
(define-data-var risk-nonce uint u0)

(define-public (register-risk (risk-type (string-ascii 64)) (severity uint) (probability uint))
  (let ((risk-id (+ (var-get risk-nonce) u1)))
    (asserts! (and (<= severity u10) (<= probability u100)) ERR-INVALID-PARAMETER)
    (map-set risk-entries risk-id {risk-type: risk-type, severity: severity, probability: probability, mitigated: false})
    (var-set risk-nonce risk-id)
    (ok risk-id)))

(define-read-only (get-risk (risk-id uint))
  (ok (map-get? risk-entries risk-id)))
