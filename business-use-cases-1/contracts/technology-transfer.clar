(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map transfers
  { transfer-id: uint }
  {
    ip-id: uint,
    from-agency: uint,
    to-entity: principal,
    approved: bool,
    transferred-at: uint
  }
)

(define-data-var transfer-nonce uint u0)

(define-public (initiate-transfer (ip-id uint) (from-agency uint) (to-entity principal))
  (let ((transfer-id (+ (var-get transfer-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set transfers { transfer-id: transfer-id }
      {
        ip-id: ip-id,
        from-agency: from-agency,
        to-entity: to-entity,
        approved: false,
        transferred-at: u0
      }
    )
    (var-set transfer-nonce transfer-id)
    (ok transfer-id)
  )
)

(define-public (approve-transfer (transfer-id uint))
  (let ((transfer (unwrap! (map-get? transfers { transfer-id: transfer-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set transfers { transfer-id: transfer-id }
      (merge transfer { approved: true, transferred-at: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-transfer (transfer-id uint))
  (ok (map-get? transfers { transfer-id: transfer-id }))
)

(define-read-only (get-transfer-count)
  (ok (var-get transfer-nonce))
)
