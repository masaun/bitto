(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))

(define-map transactions
  { tx-id: (buff 32) }
  {
    encrypted-payload: (buff 1024),
    commitment: (buff 32),
    timestamp: uint,
    sender: principal
  }
)

(define-data-var transaction-count uint u0)

(define-read-only (get-transaction (tx-id (buff 32)))
  (map-get? transactions { tx-id: tx-id })
)

(define-read-only (get-count)
  (ok (var-get transaction-count))
)

(define-public (register-transaction (tx-id (buff 32)) (encrypted-payload (buff 1024)) (commitment (buff 32)))
  (let ((current-count (var-get transaction-count)))
    (asserts! (is-none (map-get? transactions { tx-id: tx-id })) err-already-exists)
    (map-set transactions
      { tx-id: tx-id }
      {
        encrypted-payload: encrypted-payload,
        commitment: commitment,
        timestamp: stacks-block-height,
        sender: tx-sender
      }
    )
    (var-set transaction-count (+ current-count u1))
    (ok true)
  )
)

(define-public (update-transaction (tx-id (buff 32)) (encrypted-payload (buff 1024)))
  (let ((tx-data (unwrap! (map-get? transactions { tx-id: tx-id }) err-not-found)))
    (asserts! (is-eq (get sender tx-data) tx-sender) err-owner-only)
    (map-set transactions
      { tx-id: tx-id }
      (merge tx-data { encrypted-payload: encrypted-payload })
    )
    (ok true)
  )
)
