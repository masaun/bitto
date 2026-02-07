(define-map permits uint {
  applicant: principal,
  location: (string-utf8 256),
  area-size: uint,
  issue-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var permit-counter uint u0)
(define-data-var permit-authority principal tx-sender)

(define-read-only (get-permit (permit-id uint))
  (map-get? permits permit-id))

(define-public (issue-permit (applicant principal) (location (string-utf8 256)) (area-size uint) (duration uint))
  (let ((new-id (+ (var-get permit-counter) u1)))
    (asserts! (is-eq tx-sender (var-get permit-authority)) (err u1))
    (map-set permits new-id {
      applicant: applicant,
      location: location,
      area-size: area-size,
      issue-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set permit-counter new-id)
    (ok new-id)))

(define-public (revoke-permit (permit-id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get permit-authority)) (err u1))
    (asserts! (is-some (map-get? permits permit-id)) (err u2))
    (ok (map-set permits permit-id (merge (unwrap-panic (map-get? permits permit-id)) { status: "revoked" })))))
