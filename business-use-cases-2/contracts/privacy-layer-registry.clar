(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map privacy-layers
  { layer-id: uint }
  {
    layer-name: (string-ascii 50),
    config: (buff 256),
    enabled: bool,
    owner: principal
  }
)

(define-data-var layer-counter uint u0)

(define-read-only (get-layer (layer-id uint))
  (map-get? privacy-layers { layer-id: layer-id })
)

(define-read-only (get-layer-count)
  (ok (var-get layer-counter))
)

(define-public (register-layer (layer-name (string-ascii 50)) (config (buff 256)))
  (let ((layer-id (var-get layer-counter)))
    (map-set privacy-layers
      { layer-id: layer-id }
      {
        layer-name: layer-name,
        config: config,
        enabled: true,
        owner: tx-sender
      }
    )
    (var-set layer-counter (+ layer-id u1))
    (ok layer-id)
  )
)

(define-public (toggle-layer (layer-id uint) (enabled bool))
  (let ((layer-data (unwrap! (map-get? privacy-layers { layer-id: layer-id }) err-not-found)))
    (asserts! (is-eq (get owner layer-data) tx-sender) err-owner-only)
    (map-set privacy-layers
      { layer-id: layer-id }
      (merge layer-data { enabled: enabled })
    )
    (ok true)
  )
)
