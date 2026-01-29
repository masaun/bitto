(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map genomic-datasets
  { dataset-id: uint }
  {
    sample-id: uint,
    data-type: (string-ascii 50),
    sequencing-method: (string-ascii 100),
    data-hash: (buff 32),
    storage-uri: (string-ascii 200),
    size-mb: uint,
    created-at: uint,
    access-level: (string-ascii 20)
  }
)

(define-data-var dataset-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-dataset (dataset-id uint))
  (ok (map-get? genomic-datasets { dataset-id: dataset-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-dataset (sample-id uint) (data-type (string-ascii 50)) (sequencing-method (string-ascii 100)) (data-hash (buff 32)) (storage-uri (string-ascii 200)) (size-mb uint) (access-level (string-ascii 20)))
  (let
    (
      (dataset-id (var-get dataset-nonce))
    )
    (asserts! (is-none (map-get? genomic-datasets { dataset-id: dataset-id })) ERR_ALREADY_EXISTS)
    (map-set genomic-datasets
      { dataset-id: dataset-id }
      {
        sample-id: sample-id,
        data-type: data-type,
        sequencing-method: sequencing-method,
        data-hash: data-hash,
        storage-uri: storage-uri,
        size-mb: size-mb,
        created-at: stacks-block-height,
        access-level: access-level
      }
    )
    (var-set dataset-nonce (+ dataset-id u1))
    (ok dataset-id)
  )
)

(define-public (update-access-level (dataset-id uint) (access-level (string-ascii 20)))
  (let
    (
      (dataset (unwrap! (map-get? genomic-datasets { dataset-id: dataset-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set genomic-datasets
      { dataset-id: dataset-id }
      (merge dataset { access-level: access-level })
    ))
  )
)
