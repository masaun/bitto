(define-map data-access principal {
  access-level: (string-ascii 20),
  granted-by: principal,
  grant-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var data-admin principal tx-sender)

(define-read-only (get-data-access (user principal))
  (map-get? data-access user))

(define-public (grant-access (user principal) (access-level (string-ascii 20)) (duration uint))
  (begin
    (asserts! (is-eq tx-sender (var-get data-admin)) (err u1))
    (ok (map-set data-access user {
      access-level: access-level,
      granted-by: tx-sender,
      grant-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    }))))

(define-public (revoke-access (user principal))
  (begin
    (asserts! (is-eq tx-sender (var-get data-admin)) (err u1))
    (asserts! (is-some (map-get? data-access user)) (err u2))
    (ok (map-set data-access user (merge (unwrap-panic (map-get? data-access user)) { status: "revoked" })))))
