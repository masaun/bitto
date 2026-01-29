(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map retention-policies
  { policy-id: uint }
  {
    dataset-id: uint,
    retention-period: uint,
    archival-required: bool,
    deletion-method: (string-ascii 100),
    policy-hash: (buff 32),
    created-at: uint,
    scheduled-deletion: (optional uint)
  }
)

(define-data-var policy-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-retention-policy (policy-id uint))
  (ok (map-get? retention-policies { policy-id: policy-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (create-policy (dataset-id uint) (retention-period uint) (archival-required bool) (deletion-method (string-ascii 100)) (policy-hash (buff 32)))
  (let
    (
      (policy-id (var-get policy-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? retention-policies { policy-id: policy-id })) ERR_ALREADY_EXISTS)
    (map-set retention-policies
      { policy-id: policy-id }
      {
        dataset-id: dataset-id,
        retention-period: retention-period,
        archival-required: archival-required,
        deletion-method: deletion-method,
        policy-hash: policy-hash,
        created-at: stacks-block-height,
        scheduled-deletion: none
      }
    )
    (var-set policy-nonce (+ policy-id u1))
    (ok policy-id)
  )
)

(define-public (schedule-deletion (policy-id uint) (deletion-block uint))
  (let
    (
      (policy (unwrap! (map-get? retention-policies { policy-id: policy-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set retention-policies
      { policy-id: policy-id }
      (merge policy { scheduled-deletion: (some deletion-block) })
    ))
  )
)
