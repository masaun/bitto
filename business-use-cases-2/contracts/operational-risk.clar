(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map operational-risks uint {category: (string-ascii 64), impact: uint, likelihood: uint})
(define-data-var op-risk-nonce uint u0)

(define-public (log-operational-risk (category (string-ascii 64)) (impact uint) (likelihood uint))
  (let ((risk-id (+ (var-get op-risk-nonce) u1)))
    (asserts! (and (<= impact u10) (<= likelihood u10)) ERR-INVALID-PARAMETER)
    (map-set operational-risks risk-id {category: category, impact: impact, likelihood: likelihood})
    (var-set op-risk-nonce risk-id)
    (ok risk-id)))

(define-read-only (get-operational-risk (risk-id uint))
  (ok (map-get? operational-risks risk-id)))
