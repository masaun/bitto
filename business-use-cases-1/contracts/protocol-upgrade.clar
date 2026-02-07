(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_VERSION (err u102))
(define-constant ERR_UPGRADE_IN_PROGRESS (err u103))

(define-data-var contract-owner principal tx-sender)
(define-data-var current-version uint u1)
(define-data-var upgrade-in-progress bool false)

(define-map version-registry
  uint
  {
    version-hash: (buff 32),
    deployed-by: principal,
    deployed-at: uint,
    active: bool,
    description: (string-utf8 200)
  }
)

(define-map upgrade-proposals
  uint
  {
    target-version: uint,
    proposer: principal,
    proposed-at: uint,
    approved: bool,
    executed: bool,
    approval-threshold: uint,
    approvals: uint
  }
)

(define-map upgrade-approvals
  { proposal-id: uint, approver: principal }
  bool
)

(define-map authorized-upgraders
  principal
  bool
)

(define-data-var proposal-nonce uint u0)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-current-version)
  (ok (var-get current-version))
)

(define-read-only (get-version-info (version uint))
  (ok (map-get? version-registry version))
)

(define-read-only (get-upgrade-proposal (proposal-id uint))
  (ok (map-get? upgrade-proposals proposal-id))
)

(define-read-only (is-upgrade-in-progress)
  (ok (var-get upgrade-in-progress))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (authorize-upgrader (upgrader principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set authorized-upgraders upgrader true))
  )
)

(define-public (register-version
  (version uint)
  (version-hash (buff 32))
  (description (string-utf8 200))
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set version-registry version {
      version-hash: version-hash,
      deployed-by: tx-sender,
      deployed-at: stacks-block-height,
      active: false,
      description: description
    }))
  )
)

(define-public (propose-upgrade
  (target-version uint)
  (approval-threshold uint)
)
  (let ((proposal-id (+ (var-get proposal-nonce) u1)))
    (asserts! (default-to false (map-get? authorized-upgraders tx-sender)) ERR_UNAUTHORIZED)
    (asserts! (not (var-get upgrade-in-progress)) ERR_UPGRADE_IN_PROGRESS)
    (asserts! (is-some (map-get? version-registry target-version)) ERR_INVALID_VERSION)
    (map-set upgrade-proposals proposal-id {
      target-version: target-version,
      proposer: tx-sender,
      proposed-at: stacks-block-height,
      approved: false,
      executed: false,
      approval-threshold: approval-threshold,
      approvals: u0
    })
    (var-set proposal-nonce proposal-id)
    (ok proposal-id)
  )
)

(define-public (approve-upgrade (proposal-id uint))
  (let 
    (
      (proposal (unwrap! (map-get? upgrade-proposals proposal-id) ERR_NOT_FOUND))
      (already-approved (map-get? upgrade-approvals { proposal-id: proposal-id, approver: tx-sender }))
    )
    (asserts! (default-to false (map-get? authorized-upgraders tx-sender)) ERR_UNAUTHORIZED)
    (asserts! (is-none already-approved) ERR_UNAUTHORIZED)
    (map-set upgrade-approvals { proposal-id: proposal-id, approver: tx-sender } true)
    (let ((new-approvals (+ (get approvals proposal) u1)))
      (map-set upgrade-proposals proposal-id (merge proposal { approvals: new-approvals }))
      (if (>= new-approvals (get approval-threshold proposal))
        (ok (map-set upgrade-proposals proposal-id (merge proposal { approved: true, approvals: new-approvals })))
        (ok true)
      )
    )
  )
)

(define-public (execute-upgrade (proposal-id uint))
  (let 
    (
      (proposal (unwrap! (map-get? upgrade-proposals proposal-id) ERR_NOT_FOUND))
      (old-version-data (unwrap! (map-get? version-registry (var-get current-version)) ERR_NOT_FOUND))
      (new-version-data (unwrap! (map-get? version-registry (get target-version proposal)) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (get approved proposal) ERR_UNAUTHORIZED)
    (asserts! (not (get executed proposal)) ERR_UNAUTHORIZED)
    (map-set version-registry (var-get current-version) (merge old-version-data { active: false }))
    (map-set version-registry (get target-version proposal) (merge new-version-data { active: true }))
    (var-set current-version (get target-version proposal))
    (map-set upgrade-proposals proposal-id (merge proposal { executed: true }))
    (ok true)
  )
)
