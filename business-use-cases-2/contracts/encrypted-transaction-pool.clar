(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))

(define-map pool-transactions
  { pool-id: uint }
  {
    encrypted-data: (buff 2048),
    status: (string-ascii 20),
    timestamp: uint,
    submitter: principal
  }
)

(define-data-var next-pool-id uint u0)

(define-read-only (get-pool-transaction (pool-id uint))
  (map-get? pool-transactions { pool-id: pool-id })
)

(define-read-only (get-next-id)
  (ok (var-get next-pool-id))
)

(define-public (submit-to-pool (encrypted-data (buff 2048)))
  (let ((pool-id (var-get next-pool-id)))
    (map-set pool-transactions
      { pool-id: pool-id }
      {
        encrypted-data: encrypted-data,
        status: "pending",
        timestamp: stacks-block-height,
        submitter: tx-sender
      }
    )
    (var-set next-pool-id (+ pool-id u1))
    (ok pool-id)
  )
)

(define-public (update-status (pool-id uint) (new-status (string-ascii 20)))
  (let ((tx-data (unwrap! (map-get? pool-transactions { pool-id: pool-id }) err-not-found)))
    (asserts! (is-eq (get submitter tx-data) tx-sender) err-owner-only)
    (map-set pool-transactions
      { pool-id: pool-id }
      (merge tx-data { status: new-status })
    )
    (ok true)
  )
)
