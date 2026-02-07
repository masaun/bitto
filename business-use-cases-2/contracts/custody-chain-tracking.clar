(define-map custody-records uint {
  batch-id: (string-ascii 100),
  from-party: principal,
  to-party: principal,
  transfer-date: uint,
  location: (string-utf8 256)
})

(define-data-var record-counter uint u0)

(define-read-only (get-custody-record (record-id uint))
  (map-get? custody-records record-id))

(define-public (record-transfer (batch-id (string-ascii 100)) (to-party principal) (location (string-utf8 256)))
  (let ((new-id (+ (var-get record-counter) u1)))
    (map-set custody-records new-id {
      batch-id: batch-id,
      from-party: tx-sender,
      to-party: to-party,
      transfer-date: stacks-block-height,
      location: location
    })
    (var-set record-counter new-id)
    (ok new-id)))
