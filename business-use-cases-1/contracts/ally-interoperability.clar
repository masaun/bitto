(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map interop-agreements
  { agreement-id: uint }
  {
    ally-country: (string-ascii 50),
    agreement-type: (string-ascii 50),
    active: bool,
    signed-at: uint
  }
)

(define-data-var agreement-nonce uint u0)

(define-public (create-agreement (ally-country (string-ascii 50)) (agreement-type (string-ascii 50)))
  (let ((agreement-id (+ (var-get agreement-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set interop-agreements { agreement-id: agreement-id }
      {
        ally-country: ally-country,
        agreement-type: agreement-type,
        active: true,
        signed-at: stacks-block-height
      }
    )
    (var-set agreement-nonce agreement-id)
    (ok agreement-id)
  )
)

(define-public (update-agreement-status (agreement-id uint) (active bool))
  (let ((agreement (unwrap! (map-get? interop-agreements { agreement-id: agreement-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set interop-agreements { agreement-id: agreement-id } (merge agreement { active: active }))
    (ok true)
  )
)

(define-read-only (get-agreement (agreement-id uint))
  (ok (map-get? interop-agreements { agreement-id: agreement-id }))
)

(define-read-only (get-agreement-count)
  (ok (var-get agreement-nonce))
)
