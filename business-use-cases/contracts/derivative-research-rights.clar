(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map derivative-rights
  { rights-id: uint }
  {
    dataset-id: uint,
    derivative-type: (string-ascii 50),
    researcher: principal,
    discovery-hash: (buff 32),
    ownership-share: uint,
    granted-at: uint,
    exclusive: bool
  }
)

(define-data-var rights-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-rights (rights-id uint))
  (ok (map-get? derivative-rights { rights-id: rights-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-rights (dataset-id uint) (derivative-type (string-ascii 50)) (researcher principal) (discovery-hash (buff 32)) (ownership-share uint) (exclusive bool))
  (let
    (
      (rights-id (var-get rights-nonce))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? derivative-rights { rights-id: rights-id })) ERR_ALREADY_EXISTS)
    (map-set derivative-rights
      { rights-id: rights-id }
      {
        dataset-id: dataset-id,
        derivative-type: derivative-type,
        researcher: researcher,
        discovery-hash: discovery-hash,
        ownership-share: ownership-share,
        granted-at: stacks-block-height,
        exclusive: exclusive
      }
    )
    (var-set rights-nonce (+ rights-id u1))
    (ok rights-id)
  )
)
