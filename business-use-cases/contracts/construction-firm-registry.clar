(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map construction-firms
  { firm-id: uint }
  {
    name: (string-ascii 100),
    license-number: (string-ascii 50),
    verified: bool,
    registered-at: uint
  }
)

(define-data-var firm-nonce uint u0)

(define-public (register-firm (name (string-ascii 100)) (license-number (string-ascii 50)))
  (let ((firm-id (+ (var-get firm-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set construction-firms { firm-id: firm-id }
      {
        name: name,
        license-number: license-number,
        verified: false,
        registered-at: stacks-block-height
      }
    )
    (var-set firm-nonce firm-id)
    (ok firm-id)
  )
)

(define-public (verify-firm (firm-id uint) (verified bool))
  (let ((firm (unwrap! (map-get? construction-firms { firm-id: firm-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set construction-firms { firm-id: firm-id } (merge firm { verified: verified }))
    (ok true)
  )
)

(define-read-only (get-firm (firm-id uint))
  (ok (map-get? construction-firms { firm-id: firm-id }))
)

(define-read-only (get-firm-count)
  (ok (var-get firm-nonce))
)
