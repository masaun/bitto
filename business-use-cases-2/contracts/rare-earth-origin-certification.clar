(define-map certifications (string-ascii 100) {
  issuer: principal,
  origin: (string-ascii 100),
  material-type: (string-ascii 50),
  quantity: uint,
  issue-date: uint,
  status: (string-ascii 20)
})

(define-data-var cert-authority principal tx-sender)

(define-read-only (get-certification (cert-id (string-ascii 100)))
  (map-get? certifications cert-id))

(define-public (issue-certification (cert-id (string-ascii 100)) (origin (string-ascii 100)) (material-type (string-ascii 50)) (quantity uint))
  (begin
    (asserts! (is-eq tx-sender (var-get cert-authority)) (err u1))
    (asserts! (is-none (map-get? certifications cert-id)) (err u2))
    (ok (map-set certifications cert-id {
      issuer: tx-sender,
      origin: origin,
      material-type: material-type,
      quantity: quantity,
      issue-date: stacks-block-height,
      status: "valid"
    }))))

(define-public (revoke-certification (cert-id (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender (var-get cert-authority)) (err u1))
    (asserts! (is-some (map-get? certifications cert-id)) (err u2))
    (ok (map-set certifications cert-id (merge (unwrap-panic (map-get? certifications cert-id)) { status: "revoked" })))))
