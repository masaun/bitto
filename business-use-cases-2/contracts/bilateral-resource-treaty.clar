(define-map treaties uint {
  country-a: (string-ascii 50),
  country-b: (string-ascii 50),
  resource-type: (string-ascii 50),
  treaty-terms: (string-utf8 512),
  effective-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var treaty-counter uint u0)
(define-data-var treaty-authority principal tx-sender)

(define-read-only (get-treaty (treaty-id uint))
  (map-get? treaties treaty-id))

(define-public (create-treaty (country-a (string-ascii 50)) (country-b (string-ascii 50)) (resource-type (string-ascii 50)) (treaty-terms (string-utf8 512)) (duration uint))
  (let ((new-id (+ (var-get treaty-counter) u1)))
    (asserts! (is-eq tx-sender (var-get treaty-authority)) (err u1))
    (map-set treaties new-id {
      country-a: country-a,
      country-b: country-b,
      resource-type: resource-type,
      treaty-terms: treaty-terms,
      effective-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set treaty-counter new-id)
    (ok new-id)))
