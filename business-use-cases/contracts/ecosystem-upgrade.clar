(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var current-version uint u1)

(define-map version-registry
  { version: uint }
  {
    implementation-hash: (buff 32),
    deployed-at: uint,
    deployed-by: principal,
    description: (string-ascii 200),
    active: bool
  }
)

(define-map upgrade-proposals
  { upgrade-id: uint }
  {
    from-version: uint,
    to-version: uint,
    proposal-hash: (buff 32),
    proposer: principal,
    approved: bool,
    executed: bool,
    created-at: uint
  }
)

(define-data-var upgrade-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-current-version)
  (ok (var-get current-version))
)

(define-read-only (get-version-info (version uint))
  (ok (map-get? version-registry { version: version }))
)

(define-read-only (get-upgrade-proposal (upgrade-id uint))
  (ok (map-get? upgrade-proposals { upgrade-id: upgrade-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-version (version uint) (implementation-hash (buff 32)) (description (string-ascii 200)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? version-registry { version: version })) ERR_ALREADY_EXISTS)
    (ok (map-set version-registry
      { version: version }
      {
        implementation-hash: implementation-hash,
        deployed-at: stacks-block-height,
        deployed-by: tx-sender,
        description: description,
        active: false
      }
    ))
  )
)

(define-public (propose-upgrade (to-version uint) (proposal-hash (buff 32)))
  (let
    (
      (upgrade-id (var-get upgrade-nonce))
      (current-ver (var-get current-version))
    )
    (asserts! (is-none (map-get? upgrade-proposals { upgrade-id: upgrade-id })) ERR_ALREADY_EXISTS)
    (map-set upgrade-proposals
      { upgrade-id: upgrade-id }
      {
        from-version: current-ver,
        to-version: to-version,
        proposal-hash: proposal-hash,
        proposer: tx-sender,
        approved: false,
        executed: false,
        created-at: stacks-block-height
      }
    )
    (var-set upgrade-nonce (+ upgrade-id u1))
    (ok upgrade-id)
  )
)

(define-public (execute-upgrade (upgrade-id uint))
  (let
    (
      (upgrade (unwrap! (map-get? upgrade-proposals { upgrade-id: upgrade-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (var-set current-version (get to-version upgrade))
    (ok (map-set upgrade-proposals
      { upgrade-id: upgrade-id }
      (merge upgrade { executed: true })
    ))
  )
)
