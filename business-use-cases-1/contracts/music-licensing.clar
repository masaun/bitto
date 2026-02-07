(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_EXPIRED (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var license-nonce uint u0)

(define-map licenses
  uint
  {
    work-id: uint,
    licensee: principal,
    licensor: principal,
    license-type: (string-ascii 20),
    fee: uint,
    start-block: uint,
    end-block: uint,
    territory: (string-ascii 50),
    active: bool
  }
)

(define-map work-licenses
  { work-id: uint, licensee: principal }
  (list 10 uint)
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-license (license-id uint))
  (ok (map-get? licenses license-id))
)

(define-read-only (get-work-licenses (work-id uint) (licensee principal))
  (ok (map-get? work-licenses { work-id: work-id, licensee: licensee }))
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

(define-public (grant-license
  (work-id uint)
  (licensee principal)
  (license-type (string-ascii 20))
  (fee uint)
  (duration-blocks uint)
  (territory (string-ascii 50))
)
  (let 
    (
      (license-id (+ (var-get license-nonce) u1))
      (current-licenses (default-to (list) (map-get? work-licenses { work-id: work-id, licensee: licensee })))
    )
    (map-set licenses license-id {
      work-id: work-id,
      licensee: licensee,
      licensor: tx-sender,
      license-type: license-type,
      fee: fee,
      start-block: stacks-block-height,
      end-block: (+ stacks-block-height duration-blocks),
      territory: territory,
      active: true
    })
    (var-set license-nonce license-id)
    (ok license-id)
  )
)

(define-public (revoke-license (license-id uint))
  (let ((license (unwrap! (map-get? licenses license-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get licensor license)) ERR_UNAUTHORIZED)
    (ok (map-set licenses license-id (merge license { active: false })))
  )
)
