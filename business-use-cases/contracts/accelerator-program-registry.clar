(define-map programs
  { program-id: uint }
  {
    name: (string-ascii 100),
    operator: principal,
    duration: uint,
    equity-stake: uint,
    investment-amount: uint,
    created-at: uint,
    status: (string-ascii 20)
  }
)

(define-data-var program-nonce uint u0)

(define-public (register-program (name (string-ascii 100)) (duration uint) (equity uint) (investment uint))
  (let ((program-id (+ (var-get program-nonce) u1)))
    (map-set programs
      { program-id: program-id }
      {
        name: name,
        operator: tx-sender,
        duration: duration,
        equity-stake: equity,
        investment-amount: investment,
        created-at: stacks-block-height,
        status: "active"
      }
    )
    (var-set program-nonce program-id)
    (ok program-id)
  )
)

(define-public (update-program-status (program-id uint) (status (string-ascii 20)))
  (match (map-get? programs { program-id: program-id })
    program (ok (map-set programs { program-id: program-id } (merge program { status: status })))
    (err u404)
  )
)

(define-read-only (get-program (program-id uint))
  (map-get? programs { program-id: program-id })
)
