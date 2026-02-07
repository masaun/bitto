(define-map extraction-records uint {
  batch-id: (string-ascii 100),
  solvent-type: (string-ascii 50),
  stages: uint,
  efficiency: uint,
  timestamp: uint
})

(define-data-var record-counter uint u0)

(define-read-only (get-extraction-record (record-id uint))
  (map-get? extraction-records record-id))

(define-public (track-extraction (batch-id (string-ascii 100)) (solvent-type (string-ascii 50)) (stages uint) (efficiency uint))
  (let ((new-id (+ (var-get record-counter) u1)))
    (asserts! (<= efficiency u100) (err u1))
    (map-set extraction-records new-id {
      batch-id: batch-id,
      solvent-type: solvent-type,
      stages: stages,
      efficiency: efficiency,
      timestamp: stacks-block-height
    })
    (var-set record-counter new-id)
    (ok new-id)))
