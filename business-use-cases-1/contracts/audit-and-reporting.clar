(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)

(define-map authorized-reporters principal bool)

(define-map usage-reports
  { work-id: uint, period: uint, reporter: principal }
  {
    streams: uint,
    downloads: uint,
    revenue: uint,
    report-date: uint,
    verified: bool
  }
)

(define-map revenue-reports
  { entity: principal, period: uint }
  {
    total-revenue: uint,
    total-royalties-paid: uint,
    report-date: uint,
    report-hash: (buff 32)
  }
)

(define-map transparency-scores
  principal
  {
    score: uint,
    last-updated: uint
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (is-authorized-reporter (reporter principal))
  (ok (default-to false (map-get? authorized-reporters reporter)))
)

(define-read-only (get-usage-report (work-id uint) (period uint) (reporter principal))
  (ok (map-get? usage-reports { work-id: work-id, period: period, reporter: reporter }))
)

(define-read-only (get-revenue-report (entity principal) (period uint))
  (ok (map-get? revenue-reports { entity: entity, period: period }))
)

(define-read-only (get-transparency-score (entity principal))
  (ok (map-get? transparency-scores entity))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (authorize-reporter (reporter principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set authorized-reporters reporter true))
  )
)

(define-public (submit-usage-report
  (work-id uint)
  (period uint)
  (streams uint)
  (downloads uint)
  (revenue uint)
)
  (begin
    (asserts! (default-to false (map-get? authorized-reporters tx-sender)) ERR_UNAUTHORIZED)
    (ok (map-set usage-reports { work-id: work-id, period: period, reporter: tx-sender } {
      streams: streams,
      downloads: downloads,
      revenue: revenue,
      report-date: stacks-block-height,
      verified: false
    }))
  )
)

(define-public (submit-revenue-report
  (period uint)
  (total-revenue uint)
  (total-royalties-paid uint)
  (report-hash (buff 32))
)
  (begin
    (ok (map-set revenue-reports { entity: tx-sender, period: period } {
      total-revenue: total-revenue,
      total-royalties-paid: total-royalties-paid,
      report-date: stacks-block-height,
      report-hash: report-hash
    }))
  )
)

(define-public (update-transparency-score (entity principal) (score uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set transparency-scores entity {
      score: score,
      last-updated: stacks-block-height
    }))
  )
)

(define-public (verify-usage-report (work-id uint) (period uint) (reporter principal))
  (let ((report (unwrap! (map-get? usage-reports { work-id: work-id, period: period, reporter: reporter }) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set usage-reports { work-id: work-id, period: period, reporter: reporter }
      (merge report { verified: true })))
  )
)
