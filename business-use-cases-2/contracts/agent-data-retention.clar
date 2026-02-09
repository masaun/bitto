(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map retention-schedules uint {data-type: (string-ascii 64), retention-days: uint, auto-delete: bool})
(define-data-var schedule-nonce uint u0)

(define-public (create-schedule (data-type (string-ascii 64)) (retention-days uint) (auto-delete bool))
  (let ((schedule-id (+ (var-get schedule-nonce) u1)))
    (asserts! (> retention-days u0) ERR-INVALID-PARAMETER)
    (map-set retention-schedules schedule-id {data-type: data-type, retention-days: retention-days, auto-delete: auto-delete})
    (var-set schedule-nonce schedule-id)
    (ok schedule-id)))

(define-read-only (get-schedule (schedule-id uint))
  (ok (map-get? retention-schedules schedule-id)))
