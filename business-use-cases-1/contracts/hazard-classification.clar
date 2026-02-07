(define-map classifications
  { classification-id: uint }
  {
    substance-id: uint,
    ghs-class: (string-ascii 50),
    signal-word: (string-ascii 20),
    pictogram: (string-ascii 50),
    classified-at: uint
  }
)

(define-data-var classification-nonce uint u0)

(define-public (classify-hazard (substance uint) (ghs-class (string-ascii 50)) (signal (string-ascii 20)) (pictogram (string-ascii 50)))
  (let ((classification-id (+ (var-get classification-nonce) u1)))
    (map-set classifications
      { classification-id: classification-id }
      {
        substance-id: substance,
        ghs-class: ghs-class,
        signal-word: signal,
        pictogram: pictogram,
        classified-at: stacks-block-height
      }
    )
    (var-set classification-nonce classification-id)
    (ok classification-id)
  )
)

(define-read-only (get-classification (classification-id uint))
  (map-get? classifications { classification-id: classification-id })
)
