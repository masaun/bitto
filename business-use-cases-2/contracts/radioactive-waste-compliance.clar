(define-map waste-records uint {
  operator: principal,
  waste-type: (string-ascii 50),
  quantity: uint,
  storage-location: (string-utf8 256),
  disposal-method: (string-ascii 50),
  timestamp: uint,
  status: (string-ascii 20)
})

(define-data-var waste-counter uint u0)

(define-read-only (get-waste-record (record-id uint))
  (map-get? waste-records record-id))

(define-public (record-waste (waste-type (string-ascii 50)) (quantity uint) (storage-location (string-utf8 256)) (disposal-method (string-ascii 50)))
  (let ((new-id (+ (var-get waste-counter) u1)))
    (map-set waste-records new-id {
      operator: tx-sender,
      waste-type: waste-type,
      quantity: quantity,
      storage-location: storage-location,
      disposal-method: disposal-method,
      timestamp: stacks-block-height,
      status: "stored"
    })
    (var-set waste-counter new-id)
    (ok new-id)))

(define-public (update-waste-status (record-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? waste-records record-id)) (err u2))
    (let ((record (unwrap-panic (map-get? waste-records record-id))))
      (asserts! (is-eq tx-sender (get operator record)) (err u1))
      (ok (map-set waste-records record-id (merge record { status: status }))))))
