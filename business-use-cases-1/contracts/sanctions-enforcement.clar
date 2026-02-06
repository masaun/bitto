(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map sanctions
  { entity: principal }
  {
    sanctioned: bool,
    reason: (string-ascii 200),
    imposed-at: uint
  }
)

(define-public (impose-sanction (entity principal) (reason (string-ascii 200)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set sanctions { entity: entity }
      {
        sanctioned: true,
        reason: reason,
        imposed-at: stacks-block-height
      }
    )
    (ok true)
  )
)

(define-public (lift-sanction (entity principal))
  (let ((sanction (unwrap! (map-get? sanctions { entity: entity }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set sanctions { entity: entity } (merge sanction { sanctioned: false }))
    (ok true)
  )
)

(define-read-only (get-sanction (entity principal))
  (ok (map-get? sanctions { entity: entity }))
)
