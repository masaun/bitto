(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map analytics-models
  {model-id: uint}
  {
    name: (string-ascii 128),
    creator: principal,
    model-type: (string-ascii 64),
    accuracy: uint,
    price: uint,
    downloads: uint,
    active: bool
  }
)

(define-map model-licenses
  {license-id: uint}
  {
    model-id: uint,
    licensee: principal,
    price-paid: uint,
    expires-at: uint,
    purchased-at: uint
  }
)

(define-data-var model-nonce uint u0)
(define-data-var license-nonce uint u0)

(define-read-only (get-model (model-id uint))
  (map-get? analytics-models {model-id: model-id})
)

(define-read-only (get-license (license-id uint))
  (map-get? model-licenses {license-id: license-id})
)

(define-public (publish-model
  (name (string-ascii 128))
  (model-type (string-ascii 64))
  (accuracy uint)
  (price uint)
)
  (let ((model-id (var-get model-nonce)))
    (asserts! (<= accuracy u100) err-invalid-params)
    (map-set analytics-models {model-id: model-id}
      {
        name: name,
        creator: tx-sender,
        model-type: model-type,
        accuracy: accuracy,
        price: price,
        downloads: u0,
        active: true
      }
    )
    (var-set model-nonce (+ model-id u1))
    (ok model-id)
  )
)

(define-public (purchase-license (model-id uint) (duration uint))
  (let (
    (model (unwrap! (map-get? analytics-models {model-id: model-id}) err-not-found))
    (license-id (var-get license-nonce))
  )
    (asserts! (get active model) err-invalid-params)
    (map-set model-licenses {license-id: license-id}
      {
        model-id: model-id,
        licensee: tx-sender,
        price-paid: (get price model),
        expires-at: (+ stacks-block-height duration),
        purchased-at: stacks-block-height
      }
    )
    (map-set analytics-models {model-id: model-id}
      (merge model {downloads: (+ (get downloads model) u1)})
    )
    (var-set license-nonce (+ license-id u1))
    (ok license-id)
  )
)
