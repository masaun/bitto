(define-map sds-sheets
  { sds-id: uint }
  {
    substance-id: uint,
    version: uint,
    content-hash: (buff 32),
    issued-by: principal,
    issued-at: uint,
    language: (string-ascii 10)
  }
)

(define-data-var sds-nonce uint u0)

(define-public (create-sds (substance uint) (version uint) (content-hash (buff 32)) (language (string-ascii 10)))
  (let ((sds-id (+ (var-get sds-nonce) u1)))
    (map-set sds-sheets
      { sds-id: sds-id }
      {
        substance-id: substance,
        version: version,
        content-hash: content-hash,
        issued-by: tx-sender,
        issued-at: stacks-block-height,
        language: language
      }
    )
    (var-set sds-nonce sds-id)
    (ok sds-id)
  )
)

(define-read-only (get-sds (sds-id uint))
  (map-get? sds-sheets { sds-id: sds-id })
)
