(define-map sanctions-checks uint {
  entity: principal,
  country: (string-ascii 50),
  check-date: uint,
  sanctions-status: bool,
  checked-by: principal
})

(define-data-var check-counter uint u0)
(define-data-var compliance-authority principal tx-sender)

(define-read-only (get-sanctions-check (check-id uint))
  (map-get? sanctions-checks check-id))

(define-public (perform-sanctions-check (entity principal) (country (string-ascii 50)) (sanctions-status bool))
  (let ((new-id (+ (var-get check-counter) u1)))
    (asserts! (is-eq tx-sender (var-get compliance-authority)) (err u1))
    (map-set sanctions-checks new-id {
      entity: entity,
      country: country,
      check-date: stacks-block-height,
      sanctions-status: sanctions-status,
      checked-by: tx-sender
    })
    (var-set check-counter new-id)
    (ok new-id)))
