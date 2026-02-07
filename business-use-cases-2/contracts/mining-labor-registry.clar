(define-map workers principal {
  employer: principal,
  role: (string-ascii 50),
  hire-date: uint,
  status: (string-ascii 20),
  certifications: (string-ascii 100)
})

(define-read-only (get-worker (worker principal))
  (map-get? workers worker))

(define-public (register-worker (worker principal) (role (string-ascii 50)) (certifications (string-ascii 100)))
  (begin
    (ok (map-set workers worker {
      employer: tx-sender,
      role: role,
      hire-date: stacks-block-height,
      status: "active",
      certifications: certifications
    }))))

(define-public (update-worker-status (worker principal) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? workers worker)) (err u2))
    (let ((worker-data (unwrap-panic (map-get? workers worker))))
      (asserts! (is-eq tx-sender (get employer worker-data)) (err u1))
      (ok (map-set workers worker (merge worker-data { status: status }))))))
