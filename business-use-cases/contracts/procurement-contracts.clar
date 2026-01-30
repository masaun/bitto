(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-status (err u102))

(define-map contracts
  { contract-id: uint }
  {
    contractor-id: uint,
    agency-id: uint,
    amount: uint,
    status: (string-ascii 20),
    created-at: uint
  }
)

(define-data-var contract-nonce uint u0)

(define-public (create-contract (contractor-id uint) (agency-id uint) (amount uint))
  (let ((contract-id (+ (var-get contract-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set contracts { contract-id: contract-id }
      {
        contractor-id: contractor-id,
        agency-id: agency-id,
        amount: amount,
        status: "pending",
        created-at: stacks-block-height
      }
    )
    (var-set contract-nonce contract-id)
    (ok contract-id)
  )
)

(define-public (update-contract-status (contract-id uint) (status (string-ascii 20)))
  (let ((contract (unwrap! (map-get? contracts { contract-id: contract-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set contracts { contract-id: contract-id } (merge contract { status: status }))
    (ok true)
  )
)

(define-read-only (get-contract (contract-id uint))
  (ok (map-get? contracts { contract-id: contract-id }))
)

(define-read-only (get-contract-count)
  (ok (var-get contract-nonce))
)
