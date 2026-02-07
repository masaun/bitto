(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map intellectual-property
  { ip-id: uint }
  {
    title: (string-ascii 200),
    classification-level: uint,
    owner-agency: uint,
    registered-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var ip-nonce uint u0)

(define-public (register-ip (title (string-ascii 200)) (classification-level uint) (owner-agency uint))
  (let ((ip-id (+ (var-get ip-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set intellectual-property { ip-id: ip-id }
      {
        title: title,
        classification-level: classification-level,
        owner-agency: owner-agency,
        registered-at: stacks-block-height,
        status: "active"
      }
    )
    (var-set ip-nonce ip-id)
    (ok ip-id)
  )
)

(define-public (update-ip-status (ip-id uint) (status (string-ascii 20)))
  (let ((ip (unwrap! (map-get? intellectual-property { ip-id: ip-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set intellectual-property { ip-id: ip-id } (merge ip { status: status }))
    (ok true)
  )
)

(define-read-only (get-ip (ip-id uint))
  (ok (map-get? intellectual-property { ip-id: ip-id }))
)

(define-read-only (get-ip-count)
  (ok (var-get ip-nonce))
)
