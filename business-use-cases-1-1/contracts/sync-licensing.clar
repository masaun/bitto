(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_EXPIRED (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var license-nonce uint u0)

(define-map sync-licenses
  uint
  {
    work-id: uint,
    licensee: principal,
    licensor: principal,
    media-type: (string-ascii 20),
    project-name: (string-utf8 100),
    fee: uint,
    duration-blocks: uint,
    start-block: uint,
    territory: (string-ascii 50),
    exclusive: bool,
    active: bool
  }
)

(define-map work-sync-licenses
  { work-id: uint }
  (list 20 uint)
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-sync-license (license-id uint))
  (ok (map-get? sync-licenses license-id))
)

(define-read-only (get-work-sync-licenses (work-id uint))
  (ok (map-get? work-sync-licenses { work-id: work-id }))
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

(define-public (grant-sync-license
  (work-id uint)
  (licensee principal)
  (media-type (string-ascii 20))
  (project-name (string-utf8 100))
  (fee uint)
  (duration-blocks uint)
  (territory (string-ascii 50))
  (exclusive bool)
)
  (let ((license-id (+ (var-get license-nonce) u1)))
    (map-set sync-licenses license-id {
      work-id: work-id,
      licensee: licensee,
      licensor: tx-sender,
      media-type: media-type,
      project-name: project-name,
      fee: fee,
      duration-blocks: duration-blocks,
      start-block: stacks-block-height,
      territory: territory,
      exclusive: exclusive,
      active: true
    })
    (var-set license-nonce license-id)
    (ok license-id)
  )
)

(define-public (terminate-sync-license (license-id uint))
  (let ((license (unwrap! (map-get? sync-licenses license-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get licensor license)) ERR_UNAUTHORIZED)
    (ok (map-set sync-licenses license-id (merge license { active: false })))
  )
)
