(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map transparency-reports uint {report-type: (string-ascii 64), content-hash: (buff 32), published-at: uint})
(define-data-var transparency-report-nonce uint u0)

(define-public (publish-transparency-report (report-type (string-ascii 64)) (content-hash (buff 32)))
  (let ((report-id (+ (var-get transparency-report-nonce) u1)))
    (map-set transparency-reports report-id {report-type: report-type, content-hash: content-hash, published-at: stacks-block-height})
    (var-set transparency-report-nonce report-id)
    (ok report-id)))

(define-read-only (get-transparency-report (report-id uint))
  (ok (map-get? transparency-reports report-id)))
