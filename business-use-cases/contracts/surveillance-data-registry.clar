(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map surveillance-data
  { data-id: uint }
  {
    data-type: (string-ascii 50),
    classification: uint,
    captured-at: uint,
    location: (string-ascii 100)
  }
)

(define-data-var data-nonce uint u0)

(define-public (register-surveillance-data (data-type (string-ascii 50)) (classification uint) (location (string-ascii 100)))
  (let ((data-id (+ (var-get data-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set surveillance-data { data-id: data-id }
      {
        data-type: data-type,
        classification: classification,
        captured-at: stacks-block-height,
        location: location
      }
    )
    (var-set data-nonce data-id)
    (ok data-id)
  )
)

(define-read-only (get-surveillance-data (data-id uint))
  (ok (map-get? surveillance-data { data-id: data-id }))
)

(define-read-only (get-data-count)
  (ok (var-get data-nonce))
)
