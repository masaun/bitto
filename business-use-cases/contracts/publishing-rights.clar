(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_PERCENTAGE (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map publishing-rights
  { work-id: uint, writer: principal }
  {
    percentage: uint,
    role: (string-ascii 20),
    publisher: (optional principal),
    registered-at: uint
  }
)

(define-map publisher-agreements
  { work-id: uint, publisher: principal }
  {
    percentage: uint,
    territory: (string-ascii 50),
    active: bool
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-publishing-rights (work-id uint) (writer principal))
  (ok (map-get? publishing-rights { work-id: work-id, writer: writer }))
)

(define-read-only (get-publisher-agreement (work-id uint) (publisher principal))
  (ok (map-get? publisher-agreements { work-id: work-id, publisher: publisher }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-writer-share
  (work-id uint)
  (writer principal)
  (percentage uint)
  (role (string-ascii 20))
)
  (begin
    (asserts! (<= percentage u10000) ERR_INVALID_PERCENTAGE)
    (ok (map-set publishing-rights { work-id: work-id, writer: writer } {
      percentage: percentage,
      role: role,
      publisher: none,
      registered-at: stacks-block-height
    }))
  )
)

(define-public (assign-publisher
  (work-id uint)
  (publisher principal)
)
  (let ((rights (unwrap! (map-get? publishing-rights { work-id: work-id, writer: tx-sender }) ERR_NOT_FOUND)))
    (ok (map-set publishing-rights { work-id: work-id, writer: tx-sender }
      (merge rights { publisher: (some publisher) })
    ))
  )
)

(define-public (register-publisher-agreement
  (work-id uint)
  (percentage uint)
  (territory (string-ascii 50))
)
  (begin
    (asserts! (<= percentage u10000) ERR_INVALID_PERCENTAGE)
    (ok (map-set publisher-agreements { work-id: work-id, publisher: tx-sender } {
      percentage: percentage,
      territory: territory,
      active: true
    }))
  )
)
