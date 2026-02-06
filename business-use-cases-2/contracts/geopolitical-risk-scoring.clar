(define-map risk-scores uint {
  country: (string-ascii 50),
  risk-category: (string-ascii 50),
  score: uint,
  assessment-date: uint,
  assessor: principal
})

(define-data-var score-counter uint u0)

(define-read-only (get-risk-score (score-id uint))
  (map-get? risk-scores score-id))

(define-public (assess-geopolitical-risk (country (string-ascii 50)) (risk-category (string-ascii 50)) (score uint))
  (let ((new-id (+ (var-get score-counter) u1)))
    (asserts! (<= score u100) (err u1))
    (map-set risk-scores new-id {
      country: country,
      risk-category: risk-category,
      score: score,
      assessment-date: stacks-block-height,
      assessor: tx-sender
    })
    (var-set score-counter new-id)
    (ok new-id)))
