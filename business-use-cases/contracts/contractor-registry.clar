(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

(define-map contractors
  { contractor-id: uint }
  {
    name: (string-ascii 100),
    category: (string-ascii 50),
    clearance-level: uint,
    approved: bool,
    registered-at: uint
  }
)

(define-data-var contractor-nonce uint u0)

(define-public (register-contractor (name (string-ascii 100)) (category (string-ascii 50)) (clearance-level uint))
  (let ((contractor-id (+ (var-get contractor-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set contractors { contractor-id: contractor-id }
      {
        name: name,
        category: category,
        clearance-level: clearance-level,
        approved: false,
        registered-at: stacks-block-height
      }
    )
    (var-set contractor-nonce contractor-id)
    (ok contractor-id)
  )
)

(define-public (approve-contractor (contractor-id uint) (approved bool))
  (let ((contractor (unwrap! (map-get? contractors { contractor-id: contractor-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set contractors { contractor-id: contractor-id } (merge contractor { approved: approved }))
    (ok true)
  )
)

(define-read-only (get-contractor (contractor-id uint))
  (ok (map-get? contractors { contractor-id: contractor-id }))
)

(define-read-only (get-contractor-count)
  (ok (var-get contractor-nonce))
)
