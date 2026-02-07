(define-map operations uint {
  operator: principal,
  site-id: (string-ascii 100),
  operation-type: (string-ascii 50),
  start-date: uint,
  status: (string-ascii 20)
})

(define-data-var operation-counter uint u0)

(define-read-only (get-operation (operation-id uint))
  (map-get? operations operation-id))

(define-public (start-operation (site-id (string-ascii 100)) (operation-type (string-ascii 50)))
  (let ((new-id (+ (var-get operation-counter) u1)))
    (map-set operations new-id {
      operator: tx-sender,
      site-id: site-id,
      operation-type: operation-type,
      start-date: stacks-block-height,
      status: "active"
    })
    (var-set operation-counter new-id)
    (ok new-id)))

(define-public (end-operation (operation-id uint))
  (begin
    (asserts! (is-some (map-get? operations operation-id)) (err u2))
    (let ((operation (unwrap-panic (map-get? operations operation-id))))
      (asserts! (is-eq tx-sender (get operator operation)) (err u1))
      (ok (map-set operations operation-id (merge operation { status: "completed" }))))))
