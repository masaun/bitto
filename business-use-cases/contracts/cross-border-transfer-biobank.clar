(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_NOT_APPROVED (err u103))

(define-data-var contract-owner principal tx-sender)

(define-map transfer-requests
  { request-id: uint }
  {
    sample-id: uint,
    from-country: (string-ascii 50),
    to-country: (string-ascii 50),
    purpose: (string-ascii 200),
    requestor: principal,
    approved: bool,
    approval-authority: (optional principal),
    created-at: uint,
    approved-at: (optional uint)
  }
)

(define-data-var request-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-transfer-request (request-id uint))
  (ok (map-get? transfer-requests { request-id: request-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (request-transfer (sample-id uint) (from-country (string-ascii 50)) (to-country (string-ascii 50)) (purpose (string-ascii 200)))
  (let
    (
      (request-id (var-get request-nonce))
    )
    (asserts! (is-none (map-get? transfer-requests { request-id: request-id })) ERR_ALREADY_EXISTS)
    (map-set transfer-requests
      { request-id: request-id }
      {
        sample-id: sample-id,
        from-country: from-country,
        to-country: to-country,
        purpose: purpose,
        requestor: tx-sender,
        approved: false,
        approval-authority: none,
        created-at: stacks-block-height,
        approved-at: none
      }
    )
    (var-set request-nonce (+ request-id u1))
    (ok request-id)
  )
)

(define-public (approve-transfer (request-id uint))
  (let
    (
      (request (unwrap! (map-get? transfer-requests { request-id: request-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set transfer-requests
      { request-id: request-id }
      (merge request {
        approved: true,
        approval-authority: (some tx-sender),
        approved-at: (some stacks-block-height)
      })
    ))
  )
)
