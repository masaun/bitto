(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map annual-reports uint {
  farm-id: uint,
  farmer: principal,
  year: uint,
  total-yield: uint,
  revenue: uint,
  expenses: uint,
  net-profit: int,
  environmental-score: uint,
  submitted-at: uint,
  verified: bool
})

(define-map report-attachments uint {
  report-id: uint,
  document-hash: (string-ascii 64),
  document-type: (string-ascii 50),
  uploaded-at: uint
})

(define-data-var report-nonce uint u0)

(define-public (submit-annual-report (farm-id uint) (year uint) (yield uint) (rev uint) (exp uint) (profit int) (env-score uint))
  (let ((id (+ (var-get report-nonce) u1)))
    (map-set annual-reports id {
      farm-id: farm-id,
      farmer: tx-sender,
      year: year,
      total-yield: yield,
      revenue: rev,
      expenses: exp,
      net-profit: profit,
      environmental-score: env-score,
      submitted-at: block-height,
      verified: false
    })
    (var-set report-nonce id)
    (ok id)))

(define-public (attach-document (report-id uint) (doc-hash (string-ascii 64)) (doc-type (string-ascii 50)))
  (let ((report (unwrap! (map-get? annual-reports report-id) err-not-found)))
    (asserts! (is-eq tx-sender (get farmer report)) err-unauthorized)
    (map-set report-attachments report-id {
      report-id: report-id,
      document-hash: doc-hash,
      document-type: doc-type,
      uploaded-at: block-height
    })
    (ok true)))

(define-public (verify-report (report-id uint))
  (let ((report (unwrap! (map-get? annual-reports report-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set annual-reports report-id (merge report {verified: true}))
    (ok true)))

(define-read-only (get-report (id uint))
  (ok (map-get? annual-reports id)))

(define-read-only (get-attachment (report-id uint))
  (ok (map-get? report-attachments report-id)))
