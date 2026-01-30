(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map engagement-rules
  { rule-id: uint }
  {
    description: (string-ascii 200),
    active: bool,
    created-at: uint
  }
)

(define-data-var rule-nonce uint u0)

(define-public (create-rule (description (string-ascii 200)))
  (let ((rule-id (+ (var-get rule-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set engagement-rules { rule-id: rule-id }
      {
        description: description,
        active: true,
        created-at: stacks-block-height
      }
    )
    (var-set rule-nonce rule-id)
    (ok rule-id)
  )
)

(define-public (update-rule-status (rule-id uint) (active bool))
  (let ((rule (unwrap! (map-get? engagement-rules { rule-id: rule-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set engagement-rules { rule-id: rule-id } (merge rule { active: active }))
    (ok true)
  )
)

(define-read-only (get-rule (rule-id uint))
  (ok (map-get? engagement-rules { rule-id: rule-id }))
)

(define-read-only (get-rule-count)
  (ok (var-get rule-nonce))
)
