(define-map licenses uint {
  licensor: principal,
  licensee: principal,
  patent-id: (buff 32),
  license-fee: uint,
  royalty-rate: uint,
  start-date: uint,
  end-date: uint,
  status: (string-ascii 20)
})

(define-data-var license-counter uint u0)

(define-read-only (get-license (license-id uint))
  (map-get? licenses license-id))

(define-public (grant-license (licensee principal) (patent-id (buff 32)) (license-fee uint) (royalty-rate uint) (duration uint))
  (let ((new-id (+ (var-get license-counter) u1)))
    (map-set licenses new-id {
      licensor: tx-sender,
      licensee: licensee,
      patent-id: patent-id,
      license-fee: license-fee,
      royalty-rate: royalty-rate,
      start-date: stacks-block-height,
      end-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set license-counter new-id)
    (ok new-id)))
