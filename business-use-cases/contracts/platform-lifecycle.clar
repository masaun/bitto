(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map platforms
  { platform-id: uint }
  {
    name: (string-ascii 100),
    platform-type: (string-ascii 50),
    lifecycle-stage: (string-ascii 20),
    commissioned-at: uint,
    last-updated: uint
  }
)

(define-data-var platform-nonce uint u0)

(define-public (register-platform (name (string-ascii 100)) (platform-type (string-ascii 50)))
  (let ((platform-id (+ (var-get platform-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set platforms { platform-id: platform-id }
      {
        name: name,
        platform-type: platform-type,
        lifecycle-stage: "development",
        commissioned-at: stacks-block-height,
        last-updated: stacks-block-height
      }
    )
    (var-set platform-nonce platform-id)
    (ok platform-id)
  )
)

(define-public (update-lifecycle-stage (platform-id uint) (lifecycle-stage (string-ascii 20)))
  (let ((platform (unwrap! (map-get? platforms { platform-id: platform-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set platforms { platform-id: platform-id }
      (merge platform { lifecycle-stage: lifecycle-stage, last-updated: stacks-block-height })
    )
    (ok true)
  )
)

(define-read-only (get-platform (platform-id uint))
  (ok (map-get? platforms { platform-id: platform-id }))
)

(define-read-only (get-platform-count)
  (ok (var-get platform-nonce))
)
