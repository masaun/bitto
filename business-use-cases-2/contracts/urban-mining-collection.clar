(define-map collections uint {
  collector: principal,
  collection-type: (string-ascii 50),
  quantity: uint,
  collection-date: uint,
  location: (string-utf8 256),
  status: (string-ascii 20)
})

(define-data-var collection-counter uint u0)

(define-read-only (get-collection (collection-id uint))
  (map-get? collections collection-id))

(define-public (record-collection (collection-type (string-ascii 50)) (quantity uint) (location (string-utf8 256)))
  (let ((new-id (+ (var-get collection-counter) u1)))
    (map-set collections new-id {
      collector: tx-sender,
      collection-type: collection-type,
      quantity: quantity,
      collection-date: stacks-block-height,
      location: location,
      status: "collected"
    })
    (var-set collection-counter new-id)
    (ok new-id)))
