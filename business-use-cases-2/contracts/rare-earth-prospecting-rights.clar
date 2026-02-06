(define-map prospecting-rights uint {
  holder: principal,
  location: (string-utf8 256),
  mineral-types: (string-ascii 100),
  grant-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var rights-counter uint u0)
(define-data-var rights-authority principal tx-sender)

(define-read-only (get-rights (rights-id uint))
  (map-get? prospecting-rights rights-id))

(define-public (grant-rights (holder principal) (location (string-utf8 256)) (mineral-types (string-ascii 100)) (duration uint))
  (let ((new-id (+ (var-get rights-counter) u1)))
    (asserts! (is-eq tx-sender (var-get rights-authority)) (err u1))
    (map-set prospecting-rights new-id {
      holder: holder,
      location: location,
      mineral-types: mineral-types,
      grant-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set rights-counter new-id)
    (ok new-id)))

(define-public (transfer-rights (rights-id uint) (new-holder principal))
  (begin
    (asserts! (is-some (map-get? prospecting-rights rights-id)) (err u2))
    (let ((rights (unwrap-panic (map-get? prospecting-rights rights-id))))
      (asserts! (is-eq tx-sender (get holder rights)) (err u1))
      (ok (map-set prospecting-rights rights-id (merge rights { holder: new-holder }))))))
