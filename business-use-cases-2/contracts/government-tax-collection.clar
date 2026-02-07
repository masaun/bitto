(define-map tax-collections uint {
  taxpayer: principal,
  tax-type: (string-ascii 50),
  amount: uint,
  period: uint,
  collection-date: uint,
  status: (string-ascii 20)
})

(define-data-var collection-counter uint u0)
(define-data-var tax-authority principal tx-sender)

(define-read-only (get-tax-collection (collection-id uint))
  (map-get? tax-collections collection-id))

(define-public (collect-tax (taxpayer principal) (tax-type (string-ascii 50)) (amount uint) (period uint))
  (let ((new-id (+ (var-get collection-counter) u1)))
    (asserts! (is-eq tx-sender (var-get tax-authority)) (err u1))
    (map-set tax-collections new-id {
      taxpayer: taxpayer,
      tax-type: tax-type,
      amount: amount,
      period: period,
      collection-date: stacks-block-height,
      status: "collected"
    })
    (var-set collection-counter new-id)
    (ok new-id)))
