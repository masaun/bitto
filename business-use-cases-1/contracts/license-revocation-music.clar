(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_REVOKED (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map license-status
  uint
  {
    licensor: principal,
    licensee: principal,
    work-id: uint,
    license-type: (string-ascii 20),
    revoked: bool,
    revocation-reason: (optional (string-utf8 200)),
    revoked-at: (optional uint),
    cure-period-blocks: uint
  }
)

(define-map breach-notices
  { license-id: uint, notice-id: uint }
  {
    breach-type: (string-ascii 30),
    description: (string-utf8 300),
    issued-at: uint,
    cure-deadline: uint,
    cured: bool
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-license-status (license-id uint))
  (ok (map-get? license-status license-id))
)

(define-read-only (get-breach-notice (license-id uint) (notice-id uint))
  (ok (map-get? breach-notices { license-id: license-id, notice-id: notice-id }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-license-for-revocation
  (license-id uint)
  (licensee principal)
  (work-id uint)
  (license-type (string-ascii 20))
  (cure-period-blocks uint)
)
  (begin
    (ok (map-set license-status license-id {
      licensor: tx-sender,
      licensee: licensee,
      work-id: work-id,
      license-type: license-type,
      revoked: false,
      revocation-reason: none,
      revoked-at: none,
      cure-period-blocks: cure-period-blocks
    }))
  )
)

(define-public (issue-breach-notice
  (license-id uint)
  (notice-id uint)
  (breach-type (string-ascii 30))
  (description (string-utf8 300))
)
  (let 
    (
      (license (unwrap! (map-get? license-status license-id) ERR_NOT_FOUND))
      (cure-deadline (+ stacks-block-height (get cure-period-blocks license)))
    )
    (asserts! (is-eq tx-sender (get licensor license)) ERR_UNAUTHORIZED)
    (ok (map-set breach-notices { license-id: license-id, notice-id: notice-id } {
      breach-type: breach-type,
      description: description,
      issued-at: stacks-block-height,
      cure-deadline: cure-deadline,
      cured: false
    }))
  )
)

(define-public (revoke-license
  (license-id uint)
  (reason (string-utf8 200))
)
  (let ((license (unwrap! (map-get? license-status license-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get licensor license)) ERR_UNAUTHORIZED)
    (asserts! (not (get revoked license)) ERR_ALREADY_REVOKED)
    (ok (map-set license-status license-id (merge license {
      revoked: true,
      revocation-reason: (some reason),
      revoked-at: (some stacks-block-height)
    })))
  )
)

(define-public (mark-breach-cured (license-id uint) (notice-id uint))
  (let 
    (
      (license (unwrap! (map-get? license-status license-id) ERR_NOT_FOUND))
      (notice (unwrap! (map-get? breach-notices { license-id: license-id, notice-id: notice-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (get licensor license)) ERR_UNAUTHORIZED)
    (ok (map-set breach-notices { license-id: license-id, notice-id: notice-id }
      (merge notice { cured: true })))
  )
)
