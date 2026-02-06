(define-map concessions uint {
  operator: principal,
  location: (string-utf8 256),
  area-size: uint,
  grant-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-data-var concession-counter uint u0)
(define-data-var concession-authority principal tx-sender)

(define-read-only (get-concession (concession-id uint))
  (map-get? concessions concession-id))

(define-public (grant-concession (operator principal) (location (string-utf8 256)) (area-size uint) (duration uint))
  (let ((new-id (+ (var-get concession-counter) u1)))
    (asserts! (is-eq tx-sender (var-get concession-authority)) (err u1))
    (map-set concessions new-id {
      operator: operator,
      location: location,
      area-size: area-size,
      grant-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "active"
    })
    (var-set concession-counter new-id)
    (ok new-id)))

(define-public (revoke-concession (concession-id uint))
  (begin
    (asserts! (is-eq tx-sender (var-get concession-authority)) (err u1))
    (asserts! (is-some (map-get? concessions concession-id)) (err u2))
    (ok (map-set concessions concession-id (merge (unwrap-panic (map-get? concessions concession-id)) { status: "revoked" })))))
