(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map behavior-risks uint {agent: principal, risk-type: (string-ascii 64), score: uint, timestamp: uint})
(define-data-var behavior-risk-nonce uint u0)

(define-public (assess-behavior-risk (risk-type (string-ascii 64)) (score uint))
  (let ((risk-id (+ (var-get behavior-risk-nonce) u1)))
    (asserts! (<= score u100) ERR-INVALID-PARAMETER)
    (map-set behavior-risks risk-id {agent: tx-sender, risk-type: risk-type, score: score, timestamp: stacks-block-height})
    (var-set behavior-risk-nonce risk-id)
    (ok risk-id)))

(define-read-only (get-behavior-risk (risk-id uint))
  (ok (map-get? behavior-risks risk-id)))
