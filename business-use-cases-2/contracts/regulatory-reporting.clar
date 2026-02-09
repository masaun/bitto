(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map regulatory-reports uint {reporter: principal, report-type: (string-ascii 64), timestamp: uint, submitted: bool})
(define-data-var report-nonce uint u0)

(define-public (submit-report (report-type (string-ascii 64)))
  (let ((report-id (+ (var-get report-nonce) u1)))
    (map-set regulatory-reports report-id {reporter: tx-sender, report-type: report-type, timestamp: stacks-block-height, submitted: true})
    (var-set report-nonce report-id)
    (ok report-id)))

(define-read-only (get-report (report-id uint))
  (ok (map-get? regulatory-reports report-id)))
