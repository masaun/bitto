(define-map regulator-access principal {
  regulator-id: (string-ascii 50),
  access-level: (string-ascii 20),
  granted-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var access-admin principal tx-sender)

(define-read-only (get-regulator-access (regulator principal))
  (map-get? regulator-access regulator))

(define-public (grant-regulator-access (regulator principal) (regulator-id (string-ascii 50)) (access-level (string-ascii 20)) (duration uint))
  (begin
    (asserts! (is-eq tx-sender (var-get access-admin)) (err u1))
    (ok (map-set regulator-access regulator {
      regulator-id: regulator-id,
      access-level: access-level,
      granted-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    }))))

(define-public (revoke-regulator-access (regulator principal))
  (begin
    (asserts! (is-eq tx-sender (var-get access-admin)) (err u1))
    (asserts! (is-some (map-get? regulator-access regulator)) (err u2))
    (ok (map-set regulator-access regulator (merge (unwrap-panic (map-get? regulator-access regulator)) { status: "revoked" })))))
