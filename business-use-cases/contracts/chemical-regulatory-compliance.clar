(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))

(define-map compliance-records
  { record-id: (string-ascii 50) }
  {
    regulation-type: (string-ascii 100),
    compliance-status: (string-ascii 20),
    certificate-number: (string-ascii 50),
    expiry-date: uint,
    issued-by: principal,
    issued-at: uint,
    is-valid: bool
  }
)

(define-public (create-compliance-record (record-id (string-ascii 50)) (regulation-type (string-ascii 100)) (certificate-number (string-ascii 50)) (expiry-date uint))
  (begin
    (asserts! (is-none (map-get? compliance-records { record-id: record-id })) err-already-exists)
    (ok (map-set compliance-records
      { record-id: record-id }
      {
        regulation-type: regulation-type,
        compliance-status: "active",
        certificate-number: certificate-number,
        expiry-date: expiry-date,
        issued-by: tx-sender,
        issued-at: stacks-block-height,
        is-valid: true
      }
    ))
  )
)

(define-public (revoke-compliance (record-id (string-ascii 50)))
  (let ((record (unwrap! (map-get? compliance-records { record-id: record-id }) err-not-found)))
    (ok (map-set compliance-records
      { record-id: record-id }
      (merge record { is-valid: false, compliance-status: "revoked" })
    ))
  )
)

(define-read-only (get-compliance-record (record-id (string-ascii 50)))
  (map-get? compliance-records { record-id: record-id })
)
