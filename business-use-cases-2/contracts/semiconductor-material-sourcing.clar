(define-map sourcing-records uint {
  semiconductor-manufacturer: principal,
  material-type: (string-ascii 50),
  supplier: principal,
  quantity: uint,
  sourcing-date: uint,
  batch-id: (string-ascii 100)
})

(define-data-var sourcing-counter uint u0)

(define-read-only (get-sourcing-record (record-id uint))
  (map-get? sourcing-records record-id))

(define-public (record-sourcing (material-type (string-ascii 50)) (supplier principal) (quantity uint) (batch-id (string-ascii 100)))
  (let ((new-id (+ (var-get sourcing-counter) u1)))
    (map-set sourcing-records new-id {
      semiconductor-manufacturer: tx-sender,
      material-type: material-type,
      supplier: supplier,
      quantity: quantity,
      sourcing-date: stacks-block-height,
      batch-id: batch-id
    })
    (var-set sourcing-counter new-id)
    (ok new-id)))
