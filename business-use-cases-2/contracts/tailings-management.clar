(define-map tailings uint {
  operator: principal,
  site-id: (string-ascii 100),
  volume: uint,
  containment-method: (string-ascii 50),
  last-inspection: uint,
  status: (string-ascii 20)
})

(define-data-var tailings-counter uint u0)

(define-read-only (get-tailings (tailings-id uint))
  (map-get? tailings tailings-id))

(define-public (register-tailings (site-id (string-ascii 100)) (volume uint) (containment-method (string-ascii 50)))
  (let ((new-id (+ (var-get tailings-counter) u1)))
    (map-set tailings new-id {
      operator: tx-sender,
      site-id: site-id,
      volume: volume,
      containment-method: containment-method,
      last-inspection: stacks-block-height,
      status: "monitored"
    })
    (var-set tailings-counter new-id)
    (ok new-id)))

(define-public (update-inspection (tailings-id uint))
  (begin
    (asserts! (is-some (map-get? tailings tailings-id)) (err u2))
    (let ((tailing (unwrap-panic (map-get? tailings tailings-id))))
      (asserts! (is-eq tx-sender (get operator tailing)) (err u1))
      (ok (map-set tailings tailings-id (merge tailing { last-inspection: stacks-block-height }))))))
