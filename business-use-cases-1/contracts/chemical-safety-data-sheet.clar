(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map safety-data-sheets
  { sds-id: (string-ascii 50) }
  {
    chemical-id: (string-ascii 50),
    hazard-classification: (string-ascii 100),
    first-aid-measures: (string-ascii 200),
    firefighting-measures: (string-ascii 200),
    storage-requirements: (string-ascii 200),
    created-by: principal,
    created-at: uint,
    version: uint
  }
)

(define-public (create-sds (sds-id (string-ascii 50)) (chemical-id (string-ascii 50)) (hazard-classification (string-ascii 100)) (first-aid-measures (string-ascii 200)) (firefighting-measures (string-ascii 200)) (storage-requirements (string-ascii 200)))
  (begin
    (asserts! (is-none (map-get? safety-data-sheets { sds-id: sds-id })) err-already-exists)
    (ok (map-set safety-data-sheets
      { sds-id: sds-id }
      {
        chemical-id: chemical-id,
        hazard-classification: hazard-classification,
        first-aid-measures: first-aid-measures,
        firefighting-measures: firefighting-measures,
        storage-requirements: storage-requirements,
        created-by: tx-sender,
        created-at: stacks-block-height,
        version: u1
      }
    ))
  )
)

(define-public (update-sds (sds-id (string-ascii 50)) (hazard-classification (string-ascii 100)) (storage-requirements (string-ascii 200)))
  (let ((sds (unwrap! (map-get? safety-data-sheets { sds-id: sds-id }) err-not-found)))
    (asserts! (is-eq (get created-by sds) tx-sender) err-unauthorized)
    (ok (map-set safety-data-sheets
      { sds-id: sds-id }
      (merge sds { 
        hazard-classification: hazard-classification, 
        storage-requirements: storage-requirements,
        version: (+ (get version sds) u1)
      })
    ))
  )
)

(define-read-only (get-sds (sds-id (string-ascii 50)))
  (map-get? safety-data-sheets { sds-id: sds-id })
)

(define-read-only (get-sds-version (sds-id (string-ascii 50)))
  (match (map-get? safety-data-sheets { sds-id: sds-id })
    sds (ok (get version sds))
    err-not-found
  )
)
