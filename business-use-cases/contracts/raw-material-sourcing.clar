(define-map sourcing-records
  { record-id: uint }
  {
    material-name: (string-ascii 100),
    supplier-id: uint,
    quantity: uint,
    source-location: (string-ascii 100),
    sourced-at: uint,
    verified: bool
  }
)

(define-data-var record-nonce uint u0)

(define-public (record-sourcing (material (string-ascii 100)) (supplier uint) (quantity uint) (location (string-ascii 100)))
  (let ((record-id (+ (var-get record-nonce) u1)))
    (map-set sourcing-records
      { record-id: record-id }
      {
        material-name: material,
        supplier-id: supplier,
        quantity: quantity,
        source-location: location,
        sourced-at: stacks-block-height,
        verified: false
      }
    )
    (var-set record-nonce record-id)
    (ok record-id)
  )
)

(define-public (verify-sourcing (record-id uint))
  (match (map-get? sourcing-records { record-id: record-id })
    record (ok (map-set sourcing-records { record-id: record-id } (merge record { verified: true })))
    (err u404)
  )
)

(define-read-only (get-sourcing-record (record-id uint))
  (map-get? sourcing-records { record-id: record-id })
)
