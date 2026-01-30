(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map joint-ops
  { operation-id: uint }
  {
    operation-name: (string-ascii 100),
    participating-countries: (list 10 (string-ascii 50)),
    status: (string-ascii 20),
    started-at: uint
  }
)

(define-data-var operation-nonce uint u0)

(define-public (create-joint-operation (operation-name (string-ascii 100)) (participating-countries (list 10 (string-ascii 50))))
  (let ((operation-id (+ (var-get operation-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set joint-ops { operation-id: operation-id }
      {
        operation-name: operation-name,
        participating-countries: participating-countries,
        status: "planning",
        started-at: stacks-block-height
      }
    )
    (var-set operation-nonce operation-id)
    (ok operation-id)
  )
)

(define-public (update-operation-status (operation-id uint) (status (string-ascii 20)))
  (let ((operation (unwrap! (map-get? joint-ops { operation-id: operation-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set joint-ops { operation-id: operation-id } (merge operation { status: status }))
    (ok true)
  )
)

(define-read-only (get-joint-operation (operation-id uint))
  (ok (map-get? joint-ops { operation-id: operation-id }))
)

(define-read-only (get-operation-count)
  (ok (var-get operation-nonce))
)
