(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map incident-reports uint {reporter: principal, severity: uint, description: (string-ascii 256), resolved: bool})
(define-data-var report-nonce uint u0)

(define-public (file-incident (severity uint) (description (string-ascii 256)))
  (let ((report-id (+ (var-get report-nonce) u1)))
    (asserts! (<= severity u10) ERR-INVALID-PARAMETER)
    (map-set incident-reports report-id {reporter: tx-sender, severity: severity, description: description, resolved: false})
    (var-set report-nonce report-id)
    (ok report-id)))

(define-public (resolve-incident (report-id uint))
  (let ((report (unwrap! (map-get? incident-reports report-id) ERR-NOT-FOUND)))
    (ok (map-set incident-reports report-id (merge report {resolved: true})))))

(define-read-only (get-incident (report-id uint))
  (ok (map-get? incident-reports report-id)))
