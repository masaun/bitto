(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map mev-protections
  { protection-id: uint }
  {
    strategy: (string-ascii 50),
    enabled: bool,
    config: (buff 256),
    owner: principal
  }
)

(define-data-var protection-counter uint u0)

(define-read-only (get-protection (protection-id uint))
  (map-get? mev-protections { protection-id: protection-id })
)

(define-read-only (get-count)
  (ok (var-get protection-counter))
)

(define-public (register-protection (strategy (string-ascii 50)) (config (buff 256)))
  (let ((protection-id (var-get protection-counter)))
    (map-set mev-protections
      { protection-id: protection-id }
      {
        strategy: strategy,
        enabled: true,
        config: config,
        owner: tx-sender
      }
    )
    (var-set protection-counter (+ protection-id u1))
    (ok protection-id)
  )
)

(define-public (toggle-protection (protection-id uint) (enabled bool))
  (let ((prot-data (unwrap! (map-get? mev-protections { protection-id: protection-id }) err-not-found)))
    (asserts! (is-eq (get owner prot-data) tx-sender) err-owner-only)
    (map-set mev-protections
      { protection-id: protection-id }
      (merge prot-data { enabled: enabled })
    )
    (ok true)
  )
)
