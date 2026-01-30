(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map maintenance-records
  { asset-id: uint, record-id: uint }
  {
    maintenance-type: (string-ascii 50),
    performed-by: principal,
    completed: bool,
    scheduled-at: uint,
    completed-at: uint
  }
)

(define-public (schedule-maintenance (asset-id uint) (record-id uint) (maintenance-type (string-ascii 50)) (scheduled-at uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set maintenance-records { asset-id: asset-id, record-id: record-id }
      {
        maintenance-type: maintenance-type,
        performed-by: tx-sender,
        completed: false,
        scheduled-at: scheduled-at,
        completed-at: u0
      }
    )
    (ok true)
  )
)

(define-public (complete-maintenance (asset-id uint) (record-id uint))
  (let ((record (unwrap! (map-get? maintenance-records { asset-id: asset-id, record-id: record-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set maintenance-records { asset-id: asset-id, record-id: record-id }
      (merge record { completed: true, completed-at: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-maintenance-record (asset-id uint) (record-id uint))
  (ok (map-get? maintenance-records { asset-id: asset-id, record-id: record-id }))
)
