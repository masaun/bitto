(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map decryption-requests
  { request-id: uint }
  {
    encrypted-tx: (buff 1024),
    status: (string-ascii 20),
    requester: principal,
    timestamp: uint
  }
)

(define-data-var request-counter uint u0)

(define-read-only (get-request (request-id uint))
  (map-get? decryption-requests { request-id: request-id })
)

(define-read-only (get-request-count)
  (ok (var-get request-counter))
)

(define-public (create-request (encrypted-tx (buff 1024)))
  (let ((request-id (var-get request-counter)))
    (map-set decryption-requests
      { request-id: request-id }
      {
        encrypted-tx: encrypted-tx,
        status: "pending",
        requester: tx-sender,
        timestamp: stacks-block-height
      }
    )
    (var-set request-counter (+ request-id u1))
    (ok request-id)
  )
)

(define-public (update-request-status (request-id uint) (new-status (string-ascii 20)))
  (let ((req-data (unwrap! (map-get? decryption-requests { request-id: request-id }) err-not-found)))
    (asserts! (is-eq (get requester req-data) tx-sender) err-owner-only)
    (map-set decryption-requests
      { request-id: request-id }
      (merge req-data { status: new-status })
    )
    (ok true)
  )
)
