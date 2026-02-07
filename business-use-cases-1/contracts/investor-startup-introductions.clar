(define-map introductions
  { introduction-id: uint }
  {
    investor-id: uint,
    startup-id: uint,
    introduced-by: principal,
    introduction-date: uint,
    status: (string-ascii 20),
    notes: (string-ascii 200)
  }
)

(define-data-var introduction-nonce uint u0)

(define-public (create-introduction (investor uint) (startup uint) (notes (string-ascii 200)))
  (let ((introduction-id (+ (var-get introduction-nonce) u1)))
    (map-set introductions
      { introduction-id: introduction-id }
      {
        investor-id: investor,
        startup-id: startup,
        introduced-by: tx-sender,
        introduction-date: stacks-block-height,
        status: "pending",
        notes: notes
      }
    )
    (var-set introduction-nonce introduction-id)
    (ok introduction-id)
  )
)

(define-public (update-introduction-status (introduction-id uint) (status (string-ascii 20)))
  (match (map-get? introductions { introduction-id: introduction-id })
    introduction (ok (map-set introductions { introduction-id: introduction-id } (merge introduction { status: status })))
    (err u404)
  )
)

(define-read-only (get-introduction (introduction-id uint))
  (map-get? introductions { introduction-id: introduction-id })
)
