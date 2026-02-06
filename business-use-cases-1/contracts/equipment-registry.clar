(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map equipment
  { equipment-id: uint }
  {
    name: (string-ascii 100),
    equipment-type: (string-ascii 50),
    status: (string-ascii 20),
    registered-at: uint
  }
)

(define-data-var equipment-nonce uint u0)

(define-public (register-equipment (name (string-ascii 100)) (equipment-type (string-ascii 50)))
  (let ((equipment-id (+ (var-get equipment-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set equipment { equipment-id: equipment-id }
      { name: name, equipment-type: equipment-type, status: "available", registered-at: stacks-block-height }
    )
    (var-set equipment-nonce equipment-id)
    (ok equipment-id)
  )
)

(define-public (update-equipment-status (equipment-id uint) (status (string-ascii 20)))
  (let ((equip (unwrap! (map-get? equipment { equipment-id: equipment-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set equipment { equipment-id: equipment-id } (merge equip { status: status }))
    (ok true)
  )
)

(define-read-only (get-equipment (equipment-id uint))
  (ok (map-get? equipment { equipment-id: equipment-id }))
)

(define-read-only (get-equipment-count)
  (ok (var-get equipment-nonce))
)
