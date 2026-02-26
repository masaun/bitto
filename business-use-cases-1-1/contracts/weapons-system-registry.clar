(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map weapons
  { weapon-id: uint }
  {
    name: (string-ascii 100),
    category: (string-ascii 50),
    serial-number: (string-ascii 100),
    status: (string-ascii 20),
    registered-at: uint
  }
)

(define-data-var weapon-nonce uint u0)

(define-public (register-weapon (name (string-ascii 100)) (category (string-ascii 50)) (serial-number (string-ascii 100)))
  (let ((weapon-id (+ (var-get weapon-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set weapons { weapon-id: weapon-id }
      {
        name: name,
        category: category,
        serial-number: serial-number,
        status: "active",
        registered-at: stacks-block-height
      }
    )
    (var-set weapon-nonce weapon-id)
    (ok weapon-id)
  )
)

(define-public (update-weapon-status (weapon-id uint) (status (string-ascii 20)))
  (let ((weapon (unwrap! (map-get? weapons { weapon-id: weapon-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set weapons { weapon-id: weapon-id } (merge weapon { status: status }))
    (ok true)
  )
)

(define-read-only (get-weapon (weapon-id uint))
  (ok (map-get? weapons { weapon-id: weapon-id }))
)

(define-read-only (get-weapon-count)
  (ok (var-get weapon-nonce))
)
