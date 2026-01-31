(define-map ip-disclosures
  { disclosure-id: uint }
  {
    startup-id: uint,
    ip-type: (string-ascii 50),
    description: (string-ascii 200),
    filing-number: (optional (string-ascii 100)),
    disclosed-at: uint,
    disclosed-by: principal
  }
)

(define-data-var disclosure-nonce uint u0)

(define-public (disclose-ip (startup uint) (ip-type (string-ascii 50)) (description (string-ascii 200)) (filing (optional (string-ascii 100))))
  (let ((disclosure-id (+ (var-get disclosure-nonce) u1)))
    (map-set ip-disclosures
      { disclosure-id: disclosure-id }
      {
        startup-id: startup,
        ip-type: ip-type,
        description: description,
        filing-number: filing,
        disclosed-at: stacks-block-height,
        disclosed-by: tx-sender
      }
    )
    (var-set disclosure-nonce disclosure-id)
    (ok disclosure-id)
  )
)

(define-read-only (get-ip-disclosure (disclosure-id uint))
  (map-get? ip-disclosures { disclosure-id: disclosure-id })
)
