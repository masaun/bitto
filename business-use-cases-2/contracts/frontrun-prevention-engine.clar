(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map frontrun-detections
  { detection-id: uint }
  {
    tx-hash: (buff 32),
    risk-score: uint,
    blocked: bool,
    timestamp: uint
  }
)

(define-data-var detection-counter uint u0)

(define-read-only (get-detection (detection-id uint))
  (map-get? frontrun-detections { detection-id: detection-id })
)

(define-read-only (get-count)
  (ok (var-get detection-counter))
)

(define-public (detect-frontrun (tx-hash (buff 32)) (risk-score uint))
  (let ((detection-id (var-get detection-counter)))
    (map-set frontrun-detections
      { detection-id: detection-id }
      {
        tx-hash: tx-hash,
        risk-score: risk-score,
        blocked: (>= risk-score u80),
        timestamp: stacks-block-height
      }
    )
    (var-set detection-counter (+ detection-id u1))
    (ok detection-id)
  )
)

(define-public (update-block-status (detection-id uint) (blocked bool))
  (let ((det-data (unwrap! (map-get? frontrun-detections { detection-id: detection-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set frontrun-detections
      { detection-id: detection-id }
      (merge det-data { blocked: blocked })
    )
    (ok true)
  )
)
