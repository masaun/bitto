(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map registry
  { entry-id: uint }
  {
    data: (buff 1024),
    status: (string-ascii 20),
    owner: principal,
    timestamp: uint
  }
)

(define-data-var entry-counter uint u0)

(define-read-only (get-entry (entry-id uint))
  (map-get? registry { entry-id: entry-id })
)

(define-read-only (get-count)
  (ok (var-get entry-counter))
)

(define-public (create-entry (data (buff 1024)))
  (let ((entry-id (var-get entry-counter)))
    (map-set registry
      { entry-id: entry-id }
      {
        data: data,
        status: "active",
        owner: tx-sender,
        timestamp: stacks-block-height
      }
    )
    (var-set entry-counter (+ entry-id u1))
    (ok entry-id)
  )
)

(define-public (update-entry (entry-id uint) (new-data (buff 1024)))
  (let ((entry-data (unwrap! (map-get? registry { entry-id: entry-id }) err-not-found)))
    (asserts! (is-eq (get owner entry-data) tx-sender) err-owner-only)
    (map-set registry
      { entry-id: entry-id }
      (merge entry-data { data: new-data })
    )
    (ok true)
  )
)

(define-public (update-status (entry-id uint) (new-status (string-ascii 20)))
  (let ((entry-data (unwrap! (map-get? registry { entry-id: entry-id }) err-not-found)))
    (asserts! (is-eq (get owner entry-data) tx-sender) err-owner-only)
    (map-set registry
      { entry-id: entry-id }
      (merge entry-data { status: new-status })
    )
    (ok true)
  )
)
