(define-map restoration-obligations uint {
  operator: principal,
  site-id: (string-ascii 100),
  area-size: uint,
  bond-amount: uint,
  deadline: uint,
  status: (string-ascii 20)
})

(define-data-var obligation-counter uint u0)

(define-read-only (get-obligation (obligation-id uint))
  (map-get? restoration-obligations obligation-id))

(define-public (create-obligation (site-id (string-ascii 100)) (area-size uint) (bond-amount uint) (deadline uint))
  (let ((new-id (+ (var-get obligation-counter) u1)))
    (map-set restoration-obligations new-id {
      operator: tx-sender,
      site-id: site-id,
      area-size: area-size,
      bond-amount: bond-amount,
      deadline: deadline,
      status: "pending"
    })
    (var-set obligation-counter new-id)
    (ok new-id)))

(define-public (fulfill-obligation (obligation-id uint))
  (begin
    (asserts! (is-some (map-get? restoration-obligations obligation-id)) (err u2))
    (let ((obligation (unwrap-panic (map-get? restoration-obligations obligation-id))))
      (asserts! (is-eq tx-sender (get operator obligation)) (err u1))
      (ok (map-set restoration-obligations obligation-id (merge obligation { status: "fulfilled" }))))))
