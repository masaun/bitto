(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map bias-detections uint {agent: principal, bias-type: (string-ascii 64), score: uint, mitigated: bool})
(define-data-var detection-nonce uint u0)

(define-public (detect-bias (bias-type (string-ascii 64)) (score uint))
  (let ((detection-id (+ (var-get detection-nonce) u1)))
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (map-set bias-detections detection-id {agent: tx-sender, bias-type: bias-type, score: score, mitigated: false})
    (var-set detection-nonce detection-id)
    (ok detection-id)))

(define-read-only (get-detection (detection-id uint))
  (ok (map-get? bias-detections detection-id)))
