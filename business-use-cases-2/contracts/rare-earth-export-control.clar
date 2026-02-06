(define-map export-licenses uint {
  exporter: principal,
  destination: (string-ascii 50),
  material-type: (string-ascii 50),
  quantity: uint,
  issue-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var license-counter uint u0)
(define-data-var control-authority principal tx-sender)

(define-read-only (get-export-license (license-id uint))
  (map-get? export-licenses license-id))

(define-public (issue-export-license (exporter principal) (destination (string-ascii 50)) (material-type (string-ascii 50)) (quantity uint) (duration uint))
  (let ((new-id (+ (var-get license-counter) u1)))
    (asserts! (is-eq tx-sender (var-get control-authority)) (err u1))
    (map-set export-licenses new-id {
      exporter: exporter,
      destination: destination,
      material-type: material-type,
      quantity: quantity,
      issue-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set license-counter new-id)
    (ok new-id)))

(define-public (revoke-export-license (license-id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get control-authority)) (err u1))
    (asserts! (is-some (map-get? export-licenses license-id)) (err u2))
    (ok (map-set export-licenses license-id (merge (unwrap-panic (map-get? export-licenses license-id)) { status: "revoked" })))))
