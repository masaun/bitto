(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map reorder-rules
  { rule-id: uint }
  {
    priority: uint,
    enabled: bool,
    config: (buff 256),
    creator: principal
  }
)

(define-data-var rule-counter uint u0)

(define-read-only (get-rule (rule-id uint))
  (map-get? reorder-rules { rule-id: rule-id })
)

(define-read-only (get-count)
  (ok (var-get rule-counter))
)

(define-public (create-rule (priority uint) (config (buff 256)))
  (let ((rule-id (var-get rule-counter)))
    (map-set reorder-rules
      { rule-id: rule-id }
      {
        priority: priority,
        enabled: true,
        config: config,
        creator: tx-sender
      }
    )
    (var-set rule-counter (+ rule-id u1))
    (ok rule-id)
  )
)

(define-public (toggle-rule (rule-id uint) (enabled bool))
  (let ((rule-data (unwrap! (map-get? reorder-rules { rule-id: rule-id }) err-not-found)))
    (asserts! (is-eq (get creator rule-data) tx-sender) err-owner-only)
    (map-set reorder-rules
      { rule-id: rule-id }
      (merge rule-data { enabled: enabled })
    )
    (ok true)
  )
)
