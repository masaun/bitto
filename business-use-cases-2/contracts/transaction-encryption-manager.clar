(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map encryption-keys
  { key-id: uint }
  {
    public-key: (buff 64),
    key-type: (string-ascii 20),
    active: bool,
    creator: principal
  }
)

(define-data-var key-counter uint u0)

(define-read-only (get-key (key-id uint))
  (map-get? encryption-keys { key-id: key-id })
)

(define-read-only (get-key-count)
  (ok (var-get key-counter))
)

(define-public (register-key (public-key (buff 64)) (key-type (string-ascii 20)))
  (let ((key-id (var-get key-counter)))
    (map-set encryption-keys
      { key-id: key-id }
      {
        public-key: public-key,
        key-type: key-type,
        active: true,
        creator: tx-sender
      }
    )
    (var-set key-counter (+ key-id u1))
    (ok key-id)
  )
)

(define-public (deactivate-key (key-id uint))
  (let ((key-data (unwrap! (map-get? encryption-keys { key-id: key-id }) err-not-found)))
    (asserts! (is-eq (get creator key-data) tx-sender) err-owner-only)
    (map-set encryption-keys
      { key-id: key-id }
      (merge key-data { active: false })
    )
    (ok true)
  )
)
