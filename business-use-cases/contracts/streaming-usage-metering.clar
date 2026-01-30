(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)

(define-map authorized-platforms principal bool)

(define-map usage-data
  { work-id: uint, period: uint }
  {
    streams: uint,
    downloads: uint,
    last-updated: uint
  }
)

(define-map platform-usage
  { platform: principal, work-id: uint, period: uint }
  {
    streams: uint,
    downloads: uint
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (is-platform-authorized (platform principal))
  (ok (default-to false (map-get? authorized-platforms platform)))
)

(define-read-only (get-usage-data (work-id uint) (period uint))
  (ok (map-get? usage-data { work-id: work-id, period: period }))
)

(define-read-only (get-platform-usage (platform principal) (work-id uint) (period uint))
  (ok (map-get? platform-usage { platform: platform, work-id: work-id, period: period }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (authorize-platform (platform principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set authorized-platforms platform true))
  )
)

(define-public (revoke-platform (platform principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-delete authorized-platforms platform))
  )
)

(define-public (report-usage
  (work-id uint)
  (period uint)
  (streams uint)
  (downloads uint)
)
  (let 
    (
      (current-data (default-to { streams: u0, downloads: u0, last-updated: u0 } 
        (map-get? usage-data { work-id: work-id, period: period })))
    )
    (asserts! (default-to false (map-get? authorized-platforms tx-sender)) ERR_UNAUTHORIZED)
    (map-set platform-usage { platform: tx-sender, work-id: work-id, period: period } {
      streams: streams,
      downloads: downloads
    })
    (ok (map-set usage-data { work-id: work-id, period: period } {
      streams: (+ (get streams current-data) streams),
      downloads: (+ (get downloads current-data) downloads),
      last-updated: stacks-block-height
    }))
  )
)
