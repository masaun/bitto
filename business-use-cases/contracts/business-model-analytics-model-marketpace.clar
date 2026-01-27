(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map business-models
  {model-id: uint}
  {
    name: (string-ascii 128),
    creator: principal,
    category: (string-ascii 64),
    roi-estimate: uint,
    price: uint,
    subscriptions: uint,
    active: bool
  }
)

(define-map model-subscriptions
  {subscription-id: uint}
  {
    model-id: uint,
    subscriber: principal,
    price-paid: uint,
    expires-at: uint,
    subscribed-at: uint
  }
)

(define-data-var model-nonce uint u0)
(define-data-var subscription-nonce uint u0)

(define-read-only (get-model (model-id uint))
  (map-get? business-models {model-id: model-id})
)

(define-read-only (get-subscription (subscription-id uint))
  (map-get? model-subscriptions {subscription-id: subscription-id})
)

(define-public (publish-model
  (name (string-ascii 128))
  (category (string-ascii 64))
  (roi-estimate uint)
  (price uint)
)
  (let ((model-id (var-get model-nonce)))
    (map-set business-models {model-id: model-id}
      {
        name: name,
        creator: tx-sender,
        category: category,
        roi-estimate: roi-estimate,
        price: price,
        subscriptions: u0,
        active: true
      }
    )
    (var-set model-nonce (+ model-id u1))
    (ok model-id)
  )
)

(define-public (subscribe (model-id uint) (duration uint))
  (let (
    (model (unwrap! (map-get? business-models {model-id: model-id}) err-not-found))
    (subscription-id (var-get subscription-nonce))
  )
    (asserts! (get active model) err-invalid-params)
    (map-set model-subscriptions {subscription-id: subscription-id}
      {
        model-id: model-id,
        subscriber: tx-sender,
        price-paid: (get price model),
        expires-at: (+ stacks-block-height duration),
        subscribed-at: stacks-block-height
      }
    )
    (map-set business-models {model-id: model-id}
      (merge model {subscriptions: (+ (get subscriptions model) u1)})
    )
    (var-set subscription-nonce (+ subscription-id u1))
    (ok subscription-id)
  )
)
