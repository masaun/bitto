(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map scholarships
  {scholarship-id: uint}
  {
    research-area: (string-ascii 128),
    funding-amount: uint,
    sponsor: principal,
    recipient: (optional principal),
    duration-blocks: uint,
    status: (string-ascii 16),
    created-at: uint
  }
)

(define-map applications
  {application-id: uint}
  {
    scholarship-id: uint,
    applicant: principal,
    proposal-hash: (buff 32),
    submitted-at: uint,
    status: (string-ascii 16)
  }
)

(define-map research-reports
  {report-id: uint}
  {
    scholarship-id: uint,
    researcher: principal,
    findings-hash: (buff 32),
    timestamp: uint,
    verified: bool
  }
)

(define-data-var scholarship-nonce uint u0)
(define-data-var application-nonce uint u0)
(define-data-var report-nonce uint u0)

(define-read-only (get-scholarship (scholarship-id uint))
  (map-get? scholarships {scholarship-id: scholarship-id})
)

(define-read-only (get-application (application-id uint))
  (map-get? applications {application-id: application-id})
)

(define-read-only (get-report (report-id uint))
  (map-get? research-reports {report-id: report-id})
)

(define-public (create-scholarship
  (research-area (string-ascii 128))
  (funding-amount uint)
  (duration-blocks uint)
)
  (let ((scholarship-id (var-get scholarship-nonce)))
    (asserts! (> funding-amount u0) err-invalid-params)
    (map-set scholarships {scholarship-id: scholarship-id}
      {
        research-area: research-area,
        funding-amount: funding-amount,
        sponsor: tx-sender,
        recipient: none,
        duration-blocks: duration-blocks,
        status: "open",
        created-at: stacks-block-height
      }
    )
    (var-set scholarship-nonce (+ scholarship-id u1))
    (ok scholarship-id)
  )
)

(define-public (apply-for-scholarship
  (scholarship-id uint)
  (proposal-hash (buff 32))
)
  (let (
    (scholarship (unwrap! (map-get? scholarships {scholarship-id: scholarship-id}) err-not-found))
    (application-id (var-get application-nonce))
  )
    (asserts! (is-eq (get status scholarship) "open") err-invalid-params)
    (map-set applications {application-id: application-id}
      {
        scholarship-id: scholarship-id,
        applicant: tx-sender,
        proposal-hash: proposal-hash,
        submitted-at: stacks-block-height,
        status: "pending"
      }
    )
    (var-set application-nonce (+ application-id u1))
    (ok application-id)
  )
)

(define-public (award-scholarship (scholarship-id uint) (recipient principal))
  (let ((scholarship (unwrap! (map-get? scholarships {scholarship-id: scholarship-id}) err-not-found)))
    (asserts! (is-eq tx-sender (get sponsor scholarship)) err-unauthorized)
    (ok (map-set scholarships {scholarship-id: scholarship-id}
      (merge scholarship {recipient: (some recipient), status: "awarded"})
    ))
  )
)

(define-public (submit-research-report
  (scholarship-id uint)
  (findings-hash (buff 32))
)
  (let (
    (scholarship (unwrap! (map-get? scholarships {scholarship-id: scholarship-id}) err-not-found))
    (report-id (var-get report-nonce))
  )
    (asserts! (is-eq (some tx-sender) (get recipient scholarship)) err-unauthorized)
    (map-set research-reports {report-id: report-id}
      {
        scholarship-id: scholarship-id,
        researcher: tx-sender,
        findings-hash: findings-hash,
        timestamp: stacks-block-height,
        verified: false
      }
    )
    (var-set report-nonce (+ report-id u1))
    (ok report-id)
  )
)
