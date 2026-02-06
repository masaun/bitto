(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PERCENTAGE (err u103))

(define-data-var contract-owner principal tx-sender)
(define-data-var recording-nonce uint u0)

(define-map recordings
  uint
  {
    title: (string-utf8 200),
    master-owner: principal,
    registered-at: uint,
    active: bool
  }
)

(define-map ownership-shares
  { recording-id: uint, owner: principal }
  { percentage: uint }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-recording (recording-id uint))
  (ok (map-get? recordings recording-id))
)

(define-read-only (get-ownership-share (recording-id uint) (owner principal))
  (ok (map-get? ownership-shares { recording-id: recording-id, owner: owner }))
)

(define-read-only (get-recording-nonce)
  (ok (var-get recording-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-recording (title (string-utf8 200)))
  (let ((recording-id (+ (var-get recording-nonce) u1)))
    (map-set recordings recording-id {
      title: title,
      master-owner: tx-sender,
      registered-at: stacks-block-height,
      active: true
    })
    (map-set ownership-shares { recording-id: recording-id, owner: tx-sender } { percentage: u10000 })
    (var-set recording-nonce recording-id)
    (ok recording-id)
  )
)

(define-public (set-ownership-share (recording-id uint) (owner principal) (percentage uint))
  (let ((recording (unwrap! (map-get? recordings recording-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get master-owner recording)) ERR_UNAUTHORIZED)
    (asserts! (<= percentage u10000) ERR_INVALID_PERCENTAGE)
    (ok (map-set ownership-shares { recording-id: recording-id, owner: owner } { percentage: percentage }))
  )
)

(define-public (transfer-master-ownership (recording-id uint) (new-owner principal))
  (let ((recording (unwrap! (map-get? recordings recording-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get master-owner recording)) ERR_UNAUTHORIZED)
    (ok (map-set recordings recording-id (merge recording { master-owner: new-owner })))
  )
)
