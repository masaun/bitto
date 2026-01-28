(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map esg-reports uint {
  farm-id: uint,
  reporter: principal,
  reporting-period: (string-ascii 50),
  carbon-sequestration: uint,
  water-usage: uint,
  biodiversity-score: uint,
  social-impact: uint,
  governance-score: uint,
  verified: bool,
  timestamp: uint
})

(define-map verification-status uint {
  verifier: principal,
  verified-at: uint,
  status: (string-ascii 20)
})

(define-data-var report-nonce uint u0)

(define-public (submit-esg-report (farm-id uint) (period (string-ascii 50)) (carbon uint) (water uint) (bio uint) (social uint) (gov uint))
  (let ((id (+ (var-get report-nonce) u1)))
    (map-set esg-reports id {
      farm-id: farm-id,
      reporter: tx-sender,
      reporting-period: period,
      carbon-sequestration: carbon,
      water-usage: water,
      biodiversity-score: bio,
      social-impact: social,
      governance-score: gov,
      verified: false,
      timestamp: block-height
    })
    (var-set report-nonce id)
    (ok id)))

(define-public (verify-report (report-id uint) (status (string-ascii 20)))
  (let ((report (unwrap! (map-get? esg-reports report-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set esg-reports report-id (merge report {verified: true}))
    (map-set verification-status report-id {
      verifier: tx-sender,
      verified-at: block-height,
      status: status
    })
    (ok true)))

(define-read-only (get-esg-report (id uint))
  (ok (map-get? esg-reports id)))

(define-read-only (get-verification (id uint))
  (ok (map-get? verification-status id)))
