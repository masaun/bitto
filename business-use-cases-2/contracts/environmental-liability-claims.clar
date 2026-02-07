(define-map liability-claims uint {
  claimant: principal,
  defendant: principal,
  claim-type: (string-ascii 50),
  claim-amount: uint,
  filing-date: uint,
  description: (string-utf8 512),
  status: (string-ascii 20)
})

(define-data-var claim-counter uint u0)

(define-read-only (get-liability-claim (claim-id uint))
  (map-get? liability-claims claim-id))

(define-public (file-liability-claim (defendant principal) (claim-type (string-ascii 50)) (claim-amount uint) (description (string-utf8 512)))
  (let ((new-id (+ (var-get claim-counter) u1)))
    (map-set liability-claims new-id {
      claimant: tx-sender,
      defendant: defendant,
      claim-type: claim-type,
      claim-amount: claim-amount,
      filing-date: stacks-block-height,
      description: description,
      status: "filed"
    })
    (var-set claim-counter new-id)
    (ok new-id)))

(define-public (update-claim-status (claim-id uint) (status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? liability-claims claim-id)) (err u1))
    (ok (map-set liability-claims claim-id (merge (unwrap-panic (map-get? liability-claims claim-id)) { status: status })))))
