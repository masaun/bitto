(define-map seismic-data uint {
  recorder: principal,
  location: (string-utf8 256),
  data-hash: (buff 32),
  timestamp: uint,
  quality-score: uint
})

(define-data-var data-counter uint u0)

(define-read-only (get-seismic-data (data-id uint))
  (map-get? seismic-data data-id))

(define-public (register-seismic-data (location (string-utf8 256)) (data-hash (buff 32)) (quality-score uint))
  (let ((new-id (+ (var-get data-counter) u1)))
    (asserts! (<= quality-score u100) (err u1))
    (map-set seismic-data new-id {
      recorder: tx-sender,
      location: location,
      data-hash: data-hash,
      timestamp: stacks-block-height,
      quality-score: quality-score
    })
    (var-set data-counter new-id)
    (ok new-id)))
