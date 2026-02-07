(define-map battery-recovery uint {
  recycler: principal,
  battery-type: (string-ascii 50),
  quantity: uint,
  recovery-date: uint,
  recovered-materials: (string-ascii 200),
  status: (string-ascii 20)
})

(define-data-var recovery-counter uint u0)

(define-read-only (get-battery-recovery (recovery-id uint))
  (map-get? battery-recovery recovery-id))

(define-public (track-battery-recovery (battery-type (string-ascii 50)) (quantity uint) (recovered-materials (string-ascii 200)))
  (let ((new-id (+ (var-get recovery-counter) u1)))
    (map-set battery-recovery new-id {
      recycler: tx-sender,
      battery-type: battery-type,
      quantity: quantity,
      recovery-date: stacks-block-height,
      recovered-materials: recovered-materials,
      status: "recovered"
    })
    (var-set recovery-counter new-id)
    (ok new-id)))
