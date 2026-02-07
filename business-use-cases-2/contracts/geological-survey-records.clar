(define-map surveys uint {
  surveyor: principal,
  location: (string-utf8 256),
  survey-date: uint,
  findings: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var survey-counter uint u0)
(define-data-var survey-admin principal tx-sender)

(define-read-only (get-survey (survey-id uint))
  (map-get? surveys survey-id))

(define-public (record-survey (surveyor principal) (location (string-utf8 256)) (findings (string-utf8 512)))
  (let ((new-id (+ (var-get survey-counter) u1)))
    (asserts! (is-eq tx-sender (var-get survey-admin)) (err u1))
    (map-set surveys new-id {
      surveyor: surveyor,
      location: location,
      survey-date: stacks-block-height,
      findings: findings,
      status: "verified"
    })
    (var-set survey-counter new-id)
    (ok new-id)))

(define-public (update-survey-status (survey-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-eq tx-sender (var-get survey-admin)) (err u1))
    (asserts! (is-some (map-get? surveys survey-id)) (err u2))
    (ok (map-set surveys survey-id (merge (unwrap-panic (map-get? surveys survey-id)) { status: status })))))
