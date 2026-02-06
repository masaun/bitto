(define-map licenses principal {
  license-type: (string-ascii 50),
  issue-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var licensing-authority principal tx-sender)

(define-read-only (get-license (operator principal))
  (map-get? licenses operator))

(define-read-only (is-valid-license (operator principal))
  (match (map-get? licenses operator)
    license (and (< stacks-block-height (get expiry-date license)) (is-eq (get status license) "active"))
    false))

(define-public (issue-license (operator principal) (license-type (string-ascii 50)) (duration uint))
  (begin
    (asserts! (is-eq tx-sender (var-get licensing-authority)) (err u1))
    (ok (map-set licenses operator {
      license-type: license-type,
      issue-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    }))))

(define-public (revoke-license (operator principal))
  (begin
    (asserts! (is-eq tx-sender (var-get licensing-authority)) (err u1))
    (asserts! (is-some (map-get? licenses operator)) (err u2))
    (ok (map-set licenses operator (merge (unwrap-panic (map-get? licenses operator)) { status: "revoked" })))))

(define-public (renew-license (operator principal) (duration uint))
  (begin
    (asserts! (is-eq tx-sender (var-get licensing-authority)) (err u1))
    (asserts! (is-some (map-get? licenses operator)) (err u2))
    (ok (map-set licenses operator (merge (unwrap-panic (map-get? licenses operator)) { 
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })))))
