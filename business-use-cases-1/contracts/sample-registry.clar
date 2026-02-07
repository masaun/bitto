(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map samples
  { sample-id: uint }
  {
    sample-type: (string-ascii 50),
    biobank-id: uint,
    donor-id: uint,
    collection-date: uint,
    quantity: uint,
    unit: (string-ascii 20),
    status: (string-ascii 20),
    registered-at: uint
  }
)

(define-data-var sample-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-sample (sample-id uint))
  (ok (map-get? samples { sample-id: sample-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-sample (sample-type (string-ascii 50)) (biobank-id uint) (donor-id uint) (collection-date uint) (quantity uint) (unit (string-ascii 20)))
  (let
    (
      (sample-id (var-get sample-nonce))
    )
    (asserts! (is-none (map-get? samples { sample-id: sample-id })) ERR_ALREADY_EXISTS)
    (map-set samples
      { sample-id: sample-id }
      {
        sample-type: sample-type,
        biobank-id: biobank-id,
        donor-id: donor-id,
        collection-date: collection-date,
        quantity: quantity,
        unit: unit,
        status: "collected",
        registered-at: stacks-block-height
      }
    )
    (var-set sample-nonce (+ sample-id u1))
    (ok sample-id)
  )
)

(define-public (update-sample-status (sample-id uint) (status (string-ascii 20)))
  (let
    (
      (sample (unwrap! (map-get? samples { sample-id: sample-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set samples
      { sample-id: sample-id }
      (merge sample { status: status })
    ))
  )
)
