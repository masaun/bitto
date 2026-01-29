(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var license-nonce uint u0)

(define-map mechanical-licenses
  uint
  {
    work-id: uint,
    licensee: principal,
    licensor: principal,
    units: uint,
    rate-per-unit: uint,
    issued-at: uint,
    active: bool
  }
)

(define-map work-mechanical-licenses
  { work-id: uint, licensee: principal }
  (list 10 uint)
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-mechanical-license (license-id uint))
  (ok (map-get? mechanical-licenses license-id))
)

(define-read-only (get-work-licenses (work-id uint) (licensee principal))
  (ok (map-get? work-mechanical-licenses { work-id: work-id, licensee: licensee }))
)

(define-read-only (get-license-nonce)
  (ok (var-get license-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (issue-mechanical-license
  (work-id uint)
  (licensee principal)
  (units uint)
  (rate-per-unit uint)
)
  (let ((license-id (+ (var-get license-nonce) u1)))
    (map-set mechanical-licenses license-id {
      work-id: work-id,
      licensee: licensee,
      licensor: tx-sender,
      units: units,
      rate-per-unit: rate-per-unit,
      issued-at: stacks-block-height,
      active: true
    })
    (var-set license-nonce license-id)
    (ok license-id)
  )
)

(define-public (update-units (license-id uint) (new-units uint))
  (let ((license (unwrap! (map-get? mechanical-licenses license-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get licensor license)) ERR_UNAUTHORIZED)
    (ok (map-set mechanical-licenses license-id (merge license { units: new-units })))
  )
)

(define-public (revoke-mechanical-license (license-id uint))
  (let ((license (unwrap! (map-get? mechanical-licenses license-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get licensor license)) ERR_UNAUTHORIZED)
    (ok (map-set mechanical-licenses license-id (merge license { active: false })))
  )
)
