(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map procurement
  { contract-id: uint }
  {
    project-id: uint,
    supplier-id: uint,
    amount: uint,
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var contract-nonce uint u0)

(define-public (create-procurement (project-id uint) (supplier-id uint) (amount uint))
  (let ((contract-id (+ (var-get contract-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set procurement { contract-id: contract-id }
      {
        project-id: project-id,
        supplier-id: supplier-id,
        amount: amount,
        status: "pending",
        created-at: stacks-block-height
      }
    )
    (var-set contract-nonce contract-id)
    (ok contract-id)
  )
)

(define-public (update-procurement-status (contract-id uint) (status (string-ascii 20)))
  (let ((contract (unwrap! (map-get? procurement { contract-id: contract-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set procurement { contract-id: contract-id } (merge contract { status: status }))
    (ok true)
  )
)

(define-read-only (get-procurement (contract-id uint))
  (ok (map-get? procurement { contract-id: contract-id }))
)

(define-read-only (get-contract-count)
  (ok (var-get contract-nonce))
)
