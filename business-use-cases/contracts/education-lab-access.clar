(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map records
  { record-id: (string-ascii 50) }
  {
    data-hash: (string-ascii 100),
    status: (string-ascii 20),
    created-by: principal,
    created-at: uint,
    updated-at: uint,
    is-active: bool
  }
)

(define-public (create-record (record-id (string-ascii 50)) (data-hash (string-ascii 100)))
  (begin
    (asserts! (is-none (map-get? records { record-id: record-id })) err-already-exists)
    (ok (map-set records
      { record-id: record-id }
      {
        data-hash: data-hash,
        status: "active",
        created-by: tx-sender,
        created-at: stacks-block-height,
        updated-at: stacks-block-height,
        is-active: true
      }
    ))
  )
)

(define-public (update-record (record-id (string-ascii 50)) (data-hash (string-ascii 100)))
  (let ((record (unwrap! (map-get? records { record-id: record-id }) err-not-found)))
    (asserts! (is-eq (get created-by record) tx-sender) err-unauthorized)
    (ok (map-set records
      { record-id: record-id }
      (merge record { 
        data-hash: data-hash,
        updated-at: stacks-block-height
      })
    ))
  )
)

(define-public (deactivate-record (record-id (string-ascii 50)))
  (let ((record (unwrap! (map-get? records { record-id: record-id }) err-not-found)))
    (asserts! (is-eq (get created-by record) tx-sender) err-unauthorized)
    (ok (map-set records
      { record-id: record-id }
      (merge record { is-active: false, status: "inactive" })
    ))
  )
)

(define-read-only (get-record (record-id (string-ascii 50)))
  (map-get? records { record-id: record-id })
)

(define-read-only (is-record-active (record-id (string-ascii 50)))
  (match (map-get? records { record-id: record-id })
    record (ok (get is-active record))
    err-not-found
  )
)
