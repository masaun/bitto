(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var work-nonce uint u0)

(define-map works
  uint
  {
    title: (string-utf8 200),
    creator: principal,
    isrc: (optional (string-ascii 12)),
    iswc: (optional (string-ascii 15)),
    registered-at: uint
  }
)

(define-map creator-works
  { creator: principal, work-id: uint }
  bool
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-work (work-id uint))
  (ok (map-get? works work-id))
)

(define-read-only (get-work-nonce)
  (ok (var-get work-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-work 
  (title (string-utf8 200))
  (isrc (optional (string-ascii 12)))
  (iswc (optional (string-ascii 15)))
)
  (let ((work-id (+ (var-get work-nonce) u1)))
    (map-set works work-id {
      title: title,
      creator: tx-sender,
      isrc: isrc,
      iswc: iswc,
      registered-at: stacks-block-height
    })
    (map-set creator-works { creator: tx-sender, work-id: work-id } true)
    (var-set work-nonce work-id)
    (ok work-id)
  )
)

(define-public (update-work-codes
  (work-id uint)
  (isrc (optional (string-ascii 12)))
  (iswc (optional (string-ascii 15)))
)
  (let ((work (unwrap! (map-get? works work-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get creator work)) ERR_UNAUTHORIZED)
    (ok (map-set works work-id (merge work { isrc: isrc, iswc: iswc })))
  )
)
