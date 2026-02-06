(define-map production-ledger uint {
  operator: principal,
  material-type: (string-ascii 50),
  quantity: uint,
  production-date: uint,
  location: (string-utf8 256)
})

(define-data-var ledger-counter uint u0)

(define-read-only (get-production-record (record-id uint))
  (map-get? production-ledger record-id))

(define-public (record-production (material-type (string-ascii 50)) (quantity uint) (location (string-utf8 256)))
  (let ((new-id (+ (var-get ledger-counter) u1)))
    (map-set production-ledger new-id {
      operator: tx-sender,
      material-type: material-type,
      quantity: quantity,
      production-date: stacks-block-height,
      location: location
    })
    (var-set ledger-counter new-id)
    (ok new-id)))
