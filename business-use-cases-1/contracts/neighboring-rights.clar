(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)

(define-map neighboring-rights
  { recording-id: uint, performer: principal }
  {
    role: (string-ascii 30),
    percentage: uint,
    registered-at: uint
  }
)

(define-map producer-rights
  { recording-id: uint, producer: principal }
  {
    percentage: uint,
    registered-at: uint
  }
)

(define-map rights-claims
  { recording-id: uint, claimant: principal, period: uint }
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-performer-rights (recording-id uint) (performer principal))
  (ok (map-get? neighboring-rights { recording-id: recording-id, performer: performer }))
)

(define-read-only (get-producer-rights (recording-id uint) (producer principal))
  (ok (map-get? producer-rights { recording-id: recording-id, producer: producer }))
)

(define-read-only (get-rights-claim (recording-id uint) (claimant principal) (period uint))
  (ok (map-get? rights-claims { recording-id: recording-id, claimant: claimant, period: period }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-performer-rights
  (recording-id uint)
  (performer principal)
  (role (string-ascii 30))
  (percentage uint)
)
  (begin
    (ok (map-set neighboring-rights { recording-id: recording-id, performer: performer } {
      role: role,
      percentage: percentage,
      registered-at: stacks-block-height
    }))
  )
)

(define-public (register-producer-rights
  (recording-id uint)
  (producer principal)
  (percentage uint)
)
  (begin
    (ok (map-set producer-rights { recording-id: recording-id, producer: producer } {
      percentage: percentage,
      registered-at: stacks-block-height
    }))
  )
)

(define-public (claim-neighboring-royalties
  (recording-id uint)
  (period uint)
  (amount uint)
)
  (begin
    (ok (map-set rights-claims { recording-id: recording-id, claimant: tx-sender, period: period } amount))
  )
)
