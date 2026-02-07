(define-map certifications uint {
  batch-id: (string-ascii 100),
  ore-grade: uint,
  certifier: principal,
  certification-date: uint,
  status: (string-ascii 20)
})

(define-data-var cert-counter uint u0)
(define-data-var certifier-authority principal tx-sender)

(define-read-only (get-certification (cert-id uint))
  (map-get? certifications cert-id))

(define-public (certify-ore (batch-id (string-ascii 100)) (ore-grade uint))
  (let ((new-id (+ (var-get cert-counter) u1)))
    (asserts! (is-eq tx-sender (var-get certifier-authority)) (err u1))
    (map-set certifications new-id {
      batch-id: batch-id,
      ore-grade: ore-grade,
      certifier: tx-sender,
      certification-date: stacks-block-height,
      status: "valid"
    })
    (var-set cert-counter new-id)
    (ok new-id)))
