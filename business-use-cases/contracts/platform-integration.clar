(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_INTEGRATED (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map integrated-platforms
  principal
  {
    platform-name: (string-ascii 50),
    platform-type: (string-ascii 20),
    api-endpoint: (string-utf8 200),
    active: bool,
    integrated-at: uint,
    last-sync: uint
  }
)

(define-map platform-credentials
  principal
  {
    api-key-hash: (buff 32),
    verified: bool
  }
)

(define-map sync-records
  { platform: principal, sync-id: uint }
  {
    works-synced: uint,
    data-synced: (string-ascii 50),
    sync-timestamp: uint,
    success: bool
  }
)

(define-map platform-sync-count
  principal
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-platform (platform principal))
  (ok (map-get? integrated-platforms platform))
)

(define-read-only (get-platform-credentials (platform principal))
  (ok (map-get? platform-credentials platform))
)

(define-read-only (get-sync-record (platform principal) (sync-id uint))
  (ok (map-get? sync-records { platform: platform, sync-id: sync-id }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-platform
  (platform-name (string-ascii 50))
  (platform-type (string-ascii 20))
  (api-endpoint (string-utf8 200))
)
  (let ((existing (map-get? integrated-platforms tx-sender)))
    (asserts! (is-none existing) ERR_ALREADY_INTEGRATED)
    (ok (map-set integrated-platforms tx-sender {
      platform-name: platform-name,
      platform-type: platform-type,
      api-endpoint: api-endpoint,
      active: true,
      integrated-at: stacks-block-height,
      last-sync: u0
    }))
  )
)

(define-public (store-credentials (api-key-hash (buff 32)))
  (begin
    (ok (map-set platform-credentials tx-sender {
      api-key-hash: api-key-hash,
      verified: false
    }))
  )
)

(define-public (verify-platform (platform principal))
  (let ((credentials (unwrap! (map-get? platform-credentials platform) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set platform-credentials platform (merge credentials { verified: true })))
  )
)

(define-public (record-sync
  (works-synced uint)
  (data-synced (string-ascii 50))
  (success bool)
)
  (let 
    (
      (platform-data (unwrap! (map-get? integrated-platforms tx-sender) ERR_NOT_FOUND))
      (sync-count (default-to u0 (map-get? platform-sync-count tx-sender)))
      (sync-id (+ sync-count u1))
    )
    (map-set sync-records { platform: tx-sender, sync-id: sync-id } {
      works-synced: works-synced,
      data-synced: data-synced,
      sync-timestamp: stacks-block-height,
      success: success
    })
    (map-set platform-sync-count tx-sender sync-id)
    (ok (map-set integrated-platforms tx-sender 
      (merge platform-data { last-sync: stacks-block-height })))
  )
)

(define-public (deactivate-platform (platform principal))
  (let ((platform-data (unwrap! (map-get? integrated-platforms platform) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set integrated-platforms platform (merge platform-data { active: false })))
  )
)
