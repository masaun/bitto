(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map privacy-policies
  { policy-id: uint }
  {
    dataset-id: uint,
    anonymization-method: (string-ascii 100),
    privacy-level: (string-ascii 20),
    encryption-standard: (string-ascii 50),
    policy-hash: (buff 32),
    enforced: bool,
    created-at: uint
  }
)

(define-data-var policy-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-policy (policy-id uint))
  (ok (map-get? privacy-policies { policy-id: policy-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (create-policy (dataset-id uint) (anonymization-method (string-ascii 100)) (privacy-level (string-ascii 20)) (encryption-standard (string-ascii 50)) (policy-hash (buff 32)))
  (let
    (
      (policy-id (var-get policy-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? privacy-policies { policy-id: policy-id })) ERR_ALREADY_EXISTS)
    (map-set privacy-policies
      { policy-id: policy-id }
      {
        dataset-id: dataset-id,
        anonymization-method: anonymization-method,
        privacy-level: privacy-level,
        encryption-standard: encryption-standard,
        policy-hash: policy-hash,
        enforced: true,
        created-at: stacks-block-height
      }
    )
    (var-set policy-nonce (+ policy-id u1))
    (ok policy-id)
  )
)

(define-public (toggle-enforcement (policy-id uint) (enforced bool))
  (let
    (
      (policy (unwrap! (map-get? privacy-policies { policy-id: policy-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set privacy-policies
      { policy-id: policy-id }
      (merge policy { enforced: enforced })
    ))
  )
)
