(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map incidents
  { incident-id: uint }
  {
    incident-type: (string-ascii 50),
    severity: (string-ascii 20),
    affected-samples: uint,
    affected-data: uint,
    description: (string-ascii 300),
    reporter: principal,
    reported-at: uint,
    resolved: bool,
    resolution-hash: (optional (buff 32))
  }
)

(define-data-var incident-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-incident (incident-id uint))
  (ok (map-get? incidents { incident-id: incident-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (report-incident (incident-type (string-ascii 50)) (severity (string-ascii 20)) (affected-samples uint) (affected-data uint) (description (string-ascii 300)))
  (let
    (
      (incident-id (var-get incident-nonce))
    )
    (asserts! (is-none (map-get? incidents { incident-id: incident-id })) ERR_ALREADY_EXISTS)
    (map-set incidents
      { incident-id: incident-id }
      {
        incident-type: incident-type,
        severity: severity,
        affected-samples: affected-samples,
        affected-data: affected-data,
        description: description,
        reporter: tx-sender,
        reported-at: stacks-block-height,
        resolved: false,
        resolution-hash: none
      }
    )
    (var-set incident-nonce (+ incident-id u1))
    (ok incident-id)
  )
)

(define-public (resolve-incident (incident-id uint) (resolution-hash (buff 32)))
  (let
    (
      (incident (unwrap! (map-get? incidents { incident-id: incident-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set incidents
      { incident-id: incident-id }
      (merge incident {
        resolved: true,
        resolution-hash: (some resolution-hash)
      })
    ))
  )
)
