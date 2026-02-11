(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map sandwich-attacks
  { attack-id: uint }
  {
    target-tx: (buff 32),
    detected-at: uint,
    severity: uint,
    mitigated: bool
  }
)

(define-data-var attack-counter uint u0)

(define-read-only (get-attack (attack-id uint))
  (map-get? sandwich-attacks { attack-id: attack-id })
)

(define-read-only (get-count)
  (ok (var-get attack-counter))
)

(define-public (report-attack (target-tx (buff 32)) (severity uint))
  (let ((attack-id (var-get attack-counter)))
    (map-set sandwich-attacks
      { attack-id: attack-id }
      {
        target-tx: target-tx,
        detected-at: stacks-block-height,
        severity: severity,
        mitigated: false
      }
    )
    (var-set attack-counter (+ attack-id u1))
    (ok attack-id)
  )
)

(define-public (mark-mitigated (attack-id uint))
  (let ((attack-data (unwrap! (map-get? sandwich-attacks { attack-id: attack-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set sandwich-attacks
      { attack-id: attack-id }
      (merge attack-data { mitigated: true })
    )
    (ok true)
  )
)
