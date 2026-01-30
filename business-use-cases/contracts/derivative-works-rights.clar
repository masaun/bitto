(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_NOT_APPROVED (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var derivative-nonce uint u0)

(define-map derivative-works
  uint
  {
    original-work-id: uint,
    derivative-creator: principal,
    derivative-type: (string-ascii 20),
    approved: bool,
    royalty-percentage: uint,
    created-at: uint
  }
)

(define-map derivative-permissions
  { work-id: uint, creator: principal }
  {
    allowed-types: (list 5 (string-ascii 20)),
    royalty-split: uint,
    active: bool
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-derivative-work (derivative-id uint))
  (ok (map-get? derivative-works derivative-id))
)

(define-read-only (get-derivative-permission (work-id uint) (creator principal))
  (ok (map-get? derivative-permissions { work-id: work-id, creator: creator }))
)

(define-read-only (get-derivative-nonce)
  (ok (var-get derivative-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (grant-derivative-permission
  (work-id uint)
  (creator principal)
  (allowed-types (list 5 (string-ascii 20)))
  (royalty-split uint)
)
  (begin
    (ok (map-set derivative-permissions { work-id: work-id, creator: creator } {
      allowed-types: allowed-types,
      royalty-split: royalty-split,
      active: true
    }))
  )
)

(define-public (register-derivative
  (original-work-id uint)
  (derivative-type (string-ascii 20))
  (royalty-percentage uint)
)
  (let ((derivative-id (+ (var-get derivative-nonce) u1)))
    (map-set derivative-works derivative-id {
      original-work-id: original-work-id,
      derivative-creator: tx-sender,
      derivative-type: derivative-type,
      approved: false,
      royalty-percentage: royalty-percentage,
      created-at: stacks-block-height
    })
    (var-set derivative-nonce derivative-id)
    (ok derivative-id)
  )
)

(define-public (approve-derivative (derivative-id uint))
  (let ((derivative (unwrap! (map-get? derivative-works derivative-id) ERR_NOT_FOUND)))
    (map-set derivative-works derivative-id (merge derivative { approved: true }))
    (ok true)
  )
)

(define-public (revoke-permission (work-id uint) (creator principal))
  (let ((permission (unwrap! (map-get? derivative-permissions { work-id: work-id, creator: creator }) ERR_NOT_FOUND)))
    (ok (map-set derivative-permissions { work-id: work-id, creator: creator } (merge permission { active: false })))
  )
)
