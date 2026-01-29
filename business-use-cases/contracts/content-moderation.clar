(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)
(define-data-var report-nonce uint u0)

(define-map authorized-moderators principal bool)

(define-map infringement-reports
  uint
  {
    work-id: uint,
    reporter: principal,
    accused-content: (string-utf8 256),
    reason: (string-utf8 200),
    submitted-at: uint,
    status: (string-ascii 20),
    reviewed-by: (optional principal)
  }
)

(define-map takedown-actions
  { work-id: uint, platform: principal }
  {
    takedown-date: uint,
    reason: (string-utf8 200),
    restored: bool
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (is-moderator (moderator principal))
  (ok (default-to false (map-get? authorized-moderators moderator)))
)

(define-read-only (get-report (report-id uint))
  (ok (map-get? infringement-reports report-id))
)

(define-read-only (get-takedown (work-id uint) (platform principal))
  (ok (map-get? takedown-actions { work-id: work-id, platform: platform }))
)

(define-read-only (get-report-nonce)
  (ok (var-get report-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (authorize-moderator (moderator principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set authorized-moderators moderator true))
  )
)

(define-public (submit-infringement-report
  (work-id uint)
  (accused-content (string-utf8 256))
  (reason (string-utf8 200))
)
  (let ((report-id (+ (var-get report-nonce) u1)))
    (map-set infringement-reports report-id {
      work-id: work-id,
      reporter: tx-sender,
      accused-content: accused-content,
      reason: reason,
      submitted-at: stacks-block-height,
      status: "pending",
      reviewed-by: none
    })
    (var-set report-nonce report-id)
    (ok report-id)
  )
)

(define-public (review-report (report-id uint) (new-status (string-ascii 20)))
  (let ((report (unwrap! (map-get? infringement-reports report-id) ERR_NOT_FOUND)))
    (asserts! (default-to false (map-get? authorized-moderators tx-sender)) ERR_UNAUTHORIZED)
    (ok (map-set infringement-reports report-id 
      (merge report { status: new-status, reviewed-by: (some tx-sender) })))
  )
)

(define-public (execute-takedown
  (work-id uint)
  (reason (string-utf8 200))
)
  (begin
    (asserts! (default-to false (map-get? authorized-moderators tx-sender)) ERR_UNAUTHORIZED)
    (ok (map-set takedown-actions { work-id: work-id, platform: tx-sender } {
      takedown-date: stacks-block-height,
      reason: reason,
      restored: false
    }))
  )
)

(define-public (restore-content (work-id uint))
  (let ((takedown (unwrap! (map-get? takedown-actions { work-id: work-id, platform: tx-sender }) ERR_NOT_FOUND)))
    (asserts! (default-to false (map-get? authorized-moderators tx-sender)) ERR_UNAUTHORIZED)
    (ok (map-set takedown-actions { work-id: work-id, platform: tx-sender } 
      (merge takedown { restored: true })))
  )
)
