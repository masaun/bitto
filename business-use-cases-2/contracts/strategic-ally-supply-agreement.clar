(define-map supply-agreements uint {
  ally-a: (string-ascii 50),
  ally-b: (string-ascii 50),
  material-type: (string-ascii 50),
  quantity-commitment: uint,
  agreement-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var agreement-counter uint u0)
(define-data-var treaty-authority principal tx-sender)

(define-read-only (get-supply-agreement (agreement-id uint))
  (map-get? supply-agreements agreement-id))

(define-public (create-supply-agreement (ally-a (string-ascii 50)) (ally-b (string-ascii 50)) (material-type (string-ascii 50)) (quantity-commitment uint) (duration uint))
  (let ((new-id (+ (var-get agreement-counter) u1)))
    (asserts! (is-eq tx-sender (var-get treaty-authority)) (err u1))
    (map-set supply-agreements new-id {
      ally-a: ally-a,
      ally-b: ally-b,
      material-type: material-type,
      quantity-commitment: quantity-commitment,
      agreement-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set agreement-counter new-id)
    (ok new-id)))
