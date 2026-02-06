(define-map data-ownership uint {
  owner: principal,
  data-type: (string-ascii 50),
  location: (string-utf8 256),
  timestamp: uint,
  access-level: (string-ascii 20)
})

(define-data-var data-counter uint u0)

(define-read-only (get-data-ownership (data-id uint))
  (map-get? data-ownership data-id))

(define-public (register-data (data-type (string-ascii 50)) (location (string-utf8 256)) (access-level (string-ascii 20)))
  (let ((new-id (+ (var-get data-counter) u1)))
    (map-set data-ownership new-id {
      owner: tx-sender,
      data-type: data-type,
      location: location,
      timestamp: stacks-block-height,
      access-level: access-level
    })
    (var-set data-counter new-id)
    (ok new-id)))

(define-public (transfer-ownership (data-id uint) (new-owner principal))
  (begin
    (asserts! (is-some (map-get? data-ownership data-id)) (err u2))
    (let ((data (unwrap-panic (map-get? data-ownership data-id))))
      (asserts! (is-eq tx-sender (get owner data)) (err u1))
      (ok (map-set data-ownership data-id (merge data { owner: new-owner }))))))
