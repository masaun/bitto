(define-map policies uint {
  policy-name: (string-utf8 256),
  effective-date: uint,
  status: (string-ascii 20),
  country: (string-ascii 50)
})

(define-data-var policy-counter uint u0)
(define-data-var policy-admin principal tx-sender)

(define-read-only (get-policy (policy-id uint))
  (map-get? policies policy-id))

(define-public (create-policy (policy-name (string-utf8 256)) (country (string-ascii 50)))
  (let ((new-id (+ (var-get policy-counter) u1)))
    (asserts! (is-eq tx-sender (var-get policy-admin)) (err u1))
    (map-set policies new-id {
      policy-name: policy-name,
      effective-date: stacks-block-height,
      status: "active",
      country: country
    })
    (var-set policy-counter new-id)
    (ok new-id)))

(define-public (update-policy-status (policy-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-eq tx-sender (var-get policy-admin)) (err u1))
    (asserts! (is-some (map-get? policies policy-id)) (err u2))
    (ok (map-set policies policy-id (merge (unwrap-panic (map-get? policies policy-id)) { status: status })))))
