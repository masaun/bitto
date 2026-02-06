(define-map water-usage uint {
  operator: principal,
  site-id: (string-ascii 100),
  usage-amount: uint,
  usage-period: uint,
  timestamp: uint
})

(define-data-var usage-counter uint u0)

(define-read-only (get-water-usage (usage-id uint))
  (map-get? water-usage usage-id))

(define-public (record-water-usage (site-id (string-ascii 100)) (usage-amount uint) (usage-period uint))
  (let ((new-id (+ (var-get usage-counter) u1)))
    (map-set water-usage new-id {
      operator: tx-sender,
      site-id: site-id,
      usage-amount: usage-amount,
      usage-period: usage-period,
      timestamp: stacks-block-height
    })
    (var-set usage-counter new-id)
    (ok new-id)))
