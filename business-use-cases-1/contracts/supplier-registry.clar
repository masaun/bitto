(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map suppliers
  { supplier-id: uint }
  {
    name: (string-ascii 100),
    category: (string-ascii 50),
    verified: bool,
    registered-at: uint
  }
)

(define-data-var supplier-nonce uint u0)

(define-public (register-supplier (name (string-ascii 100)) (category (string-ascii 50)))
  (let ((supplier-id (+ (var-get supplier-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set suppliers { supplier-id: supplier-id }
      {
        name: name,
        category: category,
        verified: false,
        registered-at: stacks-block-height
      }
    )
    (var-set supplier-nonce supplier-id)
    (ok supplier-id)
  )
)

(define-public (verify-supplier (supplier-id uint) (verified bool))
  (let ((supplier (unwrap! (map-get? suppliers { supplier-id: supplier-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set suppliers { supplier-id: supplier-id } (merge supplier { verified: verified }))
    (ok true)
  )
)

(define-read-only (get-supplier (supplier-id uint))
  (ok (map-get? suppliers { supplier-id: supplier-id }))
)

(define-read-only (get-supplier-count)
  (ok (var-get supplier-nonce))
)
