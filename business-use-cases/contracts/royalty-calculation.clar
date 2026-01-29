(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)

(define-map rate-schedules
  (string-ascii 20)
  {
    rate-per-stream: uint,
    rate-per-download: uint,
    active: bool
  }
)

(define-map calculated-royalties
  { work-id: uint, period: uint }
  {
    total-amount: uint,
    streams: uint,
    downloads: uint,
    calculated-at: uint
  }
)

(define-map rights-holder-royalties
  { work-id: uint, holder: principal, period: uint }
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-rate-schedule (schedule-type (string-ascii 20)))
  (ok (map-get? rate-schedules schedule-type))
)

(define-read-only (get-calculated-royalties (work-id uint) (period uint))
  (ok (map-get? calculated-royalties { work-id: work-id, period: period }))
)

(define-read-only (get-holder-royalties (work-id uint) (holder principal) (period uint))
  (ok (map-get? rights-holder-royalties { work-id: work-id, holder: holder, period: period }))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (set-rate-schedule
  (schedule-type (string-ascii 20))
  (rate-per-stream uint)
  (rate-per-download uint)
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set rate-schedules schedule-type {
      rate-per-stream: rate-per-stream,
      rate-per-download: rate-per-download,
      active: true
    }))
  )
)

(define-public (calculate-royalties
  (work-id uint)
  (period uint)
  (streams uint)
  (downloads uint)
  (schedule-type (string-ascii 20))
)
  (let 
    (
      (schedule (unwrap! (map-get? rate-schedules schedule-type) ERR_NOT_FOUND))
      (stream-royalties (* streams (get rate-per-stream schedule)))
      (download-royalties (* downloads (get rate-per-download schedule)))
      (total (+ stream-royalties download-royalties))
    )
    (ok (map-set calculated-royalties { work-id: work-id, period: period } {
      total-amount: total,
      streams: streams,
      downloads: downloads,
      calculated-at: stacks-block-height
    }))
  )
)

(define-public (allocate-holder-royalty
  (work-id uint)
  (holder principal)
  (period uint)
  (amount uint)
)
  (begin
    (ok (map-set rights-holder-royalties { work-id: work-id, holder: holder, period: period } amount))
  )
)
