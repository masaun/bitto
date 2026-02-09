(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map injection-detections uint {prompt-id: uint, pattern: (string-ascii 128), severity: uint, blocked: bool})
(define-data-var detection-nonce uint u0)

(define-public (detect-injection (prompt-id uint) (pattern (string-ascii 128)) (severity uint))
  (let ((detection-id (+ (var-get detection-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set injection-detections detection-id {prompt-id: prompt-id, pattern: pattern, severity: severity, blocked: (>= severity u7)})
    (var-set detection-nonce detection-id)
    (ok detection-id)))

(define-read-only (get-detection (detection-id uint))
  (ok (map-get? injection-detections detection-id)))
