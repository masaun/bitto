(define-map import-licenses uint {
  importer: principal,
  country: (string-ascii 50),
  material-type: (string-ascii 50),
  quantity: uint,
  issue-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var license-counter uint u0)
(define-data-var license-authority principal tx-sender)

(define-read-only (get-import-license (license-id uint))
  (map-get? import-licenses license-id))

(define-public (issue-import-license (importer principal) (country (string-ascii 50)) (material-type (string-ascii 50)) (quantity uint) (duration uint))
  (let ((new-id (+ (var-get license-counter) u1)))
    (asserts! (is-eq tx-sender (var-get license-authority)) (err u1))
    (map-set import-licenses new-id {
      importer: importer,
      country: country,
      material-type: material-type,
      quantity: quantity,
      issue-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "valid"
    })
    (var-set license-counter new-id)
    (ok new-id)))

(define-public (validate-license (license-id uint))
  (match (map-get? import-licenses license-id)
    license (ok (and 
      (< stacks-block-height (get expiry-date license))
      (is-eq (get status license) "valid")))
    (err u2)))
