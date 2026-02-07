(define-map cap-table
  { entry-id: uint }
  {
    startup-id: uint,
    holder: principal,
    shares: uint,
    share-class: (string-ascii 20),
    vesting-start: uint,
    vesting-duration: uint
  }
)

(define-data-var entry-nonce uint u0)

(define-public (add-cap-table-entry (startup uint) (holder principal) (shares uint) (share-class (string-ascii 20)) (vesting-start uint) (vesting-duration uint))
  (let ((entry-id (+ (var-get entry-nonce) u1)))
    (map-set cap-table
      { entry-id: entry-id }
      {
        startup-id: startup,
        holder: holder,
        shares: shares,
        share-class: share-class,
        vesting-start: vesting-start,
        vesting-duration: vesting-duration
      }
    )
    (var-set entry-nonce entry-id)
    (ok entry-id)
  )
)

(define-read-only (get-cap-table-entry (entry-id uint))
  (map-get? cap-table { entry-id: entry-id })
)
