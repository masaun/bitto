(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map explainability-records uint {decision-id: uint, explanation: (string-ascii 256), confidence: uint})
(define-data-var explainability-nonce uint u0)

(define-public (record-explanation (decision-id uint) (explanation (string-ascii 256)) (confidence uint))
  (let ((record-id (+ (var-get explainability-nonce) u1)))
    (asserts! (<= confidence u100) ERR-INVALID-PARAMETER)
    (map-set explainability-records record-id {decision-id: decision-id, explanation: explanation, confidence: confidence})
    (var-set explainability-nonce record-id)
    (ok record-id)))

(define-read-only (get-explainability-record (record-id uint))
  (ok (map-get? explainability-records record-id)))
