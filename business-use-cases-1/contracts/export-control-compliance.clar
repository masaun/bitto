(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-not-approved (err u102))

(define-map export-requests
  { request-id: uint }
  {
    item-id: uint,
    destination-country: (string-ascii 50),
    requester: principal,
    approved: bool,
    requested-at: uint
  }
)

(define-data-var request-nonce uint u0)

(define-public (submit-export-request (item-id uint) (destination-country (string-ascii 50)))
  (let ((request-id (+ (var-get request-nonce) u1)))
    (map-set export-requests { request-id: request-id }
      {
        item-id: item-id,
        destination-country: destination-country,
        requester: tx-sender,
        approved: false,
        requested-at: stacks-block-height
      }
    )
    (var-set request-nonce request-id)
    (ok request-id)
  )
)

(define-public (approve-export (request-id uint) (approved bool))
  (let ((request (unwrap! (map-get? export-requests { request-id: request-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set export-requests { request-id: request-id } (merge request { approved: approved }))
    (ok true)
  )
)

(define-read-only (get-export-request (request-id uint))
  (ok (map-get? export-requests { request-id: request-id }))
)

(define-read-only (get-request-count)
  (ok (var-get request-nonce))
)
