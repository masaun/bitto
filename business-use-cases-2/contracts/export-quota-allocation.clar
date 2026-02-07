(define-map quotas uint {
  country: (string-ascii 50),
  material-type: (string-ascii 50),
  quota-amount: uint,
  allocated-amount: uint,
  period: uint,
  status: (string-ascii 20)
})

(define-data-var quota-counter uint u0)
(define-data-var quota-authority principal tx-sender)

(define-read-only (get-quota (quota-id uint))
  (map-get? quotas quota-id))

(define-public (set-quota (country (string-ascii 50)) (material-type (string-ascii 50)) (quota-amount uint) (period uint))
  (let ((new-id (+ (var-get quota-counter) u1)))
    (asserts! (is-eq tx-sender (var-get quota-authority)) (err u1))
    (map-set quotas new-id {
      country: country,
      material-type: material-type,
      quota-amount: quota-amount,
      allocated-amount: u0,
      period: period,
      status: "active"
    })
    (var-set quota-counter new-id)
    (ok new-id)))

(define-public (allocate-quota (quota-id uint) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get quota-authority)) (err u1))
    (asserts! (is-some (map-get? quotas quota-id)) (err u2))
    (let ((quota (unwrap-panic (map-get? quotas quota-id))))
      (asserts! (<= (+ (get allocated-amount quota) amount) (get quota-amount quota)) (err u3))
      (ok (map-set quotas quota-id (merge quota { allocated-amount: (+ (get allocated-amount quota) amount) }))))))
