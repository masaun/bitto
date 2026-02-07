(define-map transparency-scores principal {
  entity-type: (string-ascii 50),
  disclosure-score: uint,
  verification-score: uint,
  compliance-score: uint,
  overall-score: uint,
  assessment-date: uint,
  assessor: principal
})

(define-read-only (get-transparency-score (entity principal))
  (map-get? transparency-scores entity))

(define-public (assess-transparency (entity principal) (entity-type (string-ascii 50)) (disclosure-score uint) (verification-score uint) (compliance-score uint))
  (let ((overall-score (/ (+ (+ disclosure-score verification-score) compliance-score) u3)))
    (asserts! (<= disclosure-score u100) (err u1))
    (asserts! (<= verification-score u100) (err u2))
    (asserts! (<= compliance-score u100) (err u3))
    (ok (map-set transparency-scores entity {
      entity-type: entity-type,
      disclosure-score: disclosure-score,
      verification-score: verification-score,
      compliance-score: compliance-score,
      overall-score: overall-score,
      assessment-date: stacks-block-height,
      assessor: tx-sender
    }))))
