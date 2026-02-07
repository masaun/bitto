(define-map recycled-certifications (string-ascii 100) {
  recycler: principal,
  material-type: (string-ascii 50),
  recycled-quantity: uint,
  purity: uint,
  certification-date: uint,
  status: (string-ascii 20)
})

(define-data-var cert-authority principal tx-sender)

(define-read-only (get-recycled-certification (cert-id (string-ascii 100)))
  (map-get? recycled-certifications cert-id))

(define-public (certify-recycled-material (cert-id (string-ascii 100)) (recycler principal) (material-type (string-ascii 50)) (recycled-quantity uint) (purity uint))
  (begin
    (asserts! (is-eq tx-sender (var-get cert-authority)) (err u1))
    (asserts! (is-none (map-get? recycled-certifications cert-id)) (err u2))
    (asserts! (<= purity u100) (err u3))
    (ok (map-set recycled-certifications cert-id {
      recycler: recycler,
      material-type: material-type,
      recycled-quantity: recycled-quantity,
      purity: purity,
      certification-date: stacks-block-height,
      status: "certified"
    }))))
