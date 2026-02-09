(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map simulation-reports uint {simulation-id: uint, report-hash: (buff 32), findings: (string-ascii 256)})
(define-data-var report-nonce uint u0)

(define-public (generate-simulation-report (simulation-id uint) (report-hash (buff 32)) (findings (string-ascii 256)))
  (let ((report-id (+ (var-get report-nonce) u1)))
    (map-set simulation-reports report-id {simulation-id: simulation-id, report-hash: report-hash, findings: findings})
    (var-set report-nonce report-id)
    (ok report-id)))

(define-read-only (get-simulation-report (report-id uint))
  (ok (map-get? simulation-reports report-id)))
