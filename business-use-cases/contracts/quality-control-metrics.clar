(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map quality-metrics
  { metric-id: uint }
  {
    sample-id: uint,
    purity-score: uint,
    integrity-score: uint,
    contamination-level: uint,
    quality-grade: (string-ascii 10),
    assessed-by: principal,
    assessment-date: uint,
    passed: bool
  }
)

(define-data-var metric-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-quality-metric (metric-id uint))
  (ok (map-get? quality-metrics { metric-id: metric-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-quality (sample-id uint) (purity-score uint) (integrity-score uint) (contamination-level uint) (quality-grade (string-ascii 10)) (passed bool))
  (let
    (
      (metric-id (var-get metric-nonce))
    )
    (asserts! (is-none (map-get? quality-metrics { metric-id: metric-id })) ERR_ALREADY_EXISTS)
    (map-set quality-metrics
      { metric-id: metric-id }
      {
        sample-id: sample-id,
        purity-score: purity-score,
        integrity-score: integrity-score,
        contamination-level: contamination-level,
        quality-grade: quality-grade,
        assessed-by: tx-sender,
        assessment-date: stacks-block-height,
        passed: passed
      }
    )
    (var-set metric-nonce (+ metric-id u1))
    (ok metric-id)
  )
)
