(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map ip-assets
  {asset-id: uint}
  {
    title: (string-ascii 256),
    owner: principal,
    asset-type: (string-ascii 64),
    value: uint,
    royalty-rate: uint,
    active: bool,
    created-at: uint
  }
)

(define-map licenses
  {license-id: uint}
  {
    asset-id: uint,
    licensee: principal,
    duration-blocks: uint,
    fee: uint,
    granted-at: uint,
    expires-at: uint,
    status: (string-ascii 16)
  }
)

(define-map royalty-payments
  {payment-id: uint}
  {
    asset-id: uint,
    payer: principal,
    amount: uint,
    timestamp: uint
  }
)

(define-data-var asset-nonce uint u0)
(define-data-var license-nonce uint u0)
(define-data-var payment-nonce uint u0)

(define-read-only (get-ip-asset (asset-id uint))
  (map-get? ip-assets {asset-id: asset-id})
)

(define-read-only (get-license (license-id uint))
  (map-get? licenses {license-id: license-id})
)

(define-public (register-ip
  (title (string-ascii 256))
  (asset-type (string-ascii 64))
  (value uint)
  (royalty-rate uint)
)
  (let ((asset-id (var-get asset-nonce)))
    (asserts! (> value u0) err-invalid-params)
    (asserts! (<= royalty-rate u10000) err-invalid-params)
    (map-set ip-assets {asset-id: asset-id}
      {
        title: title,
        owner: tx-sender,
        asset-type: asset-type,
        value: value,
        royalty-rate: royalty-rate,
        active: true,
        created-at: stacks-block-height
      }
    )
    (var-set asset-nonce (+ asset-id u1))
    (ok asset-id)
  )
)

(define-public (grant-license
  (asset-id uint)
  (licensee principal)
  (duration-blocks uint)
  (fee uint)
)
  (let (
    (asset (unwrap! (map-get? ip-assets {asset-id: asset-id}) err-not-found))
    (license-id (var-get license-nonce))
  )
    (asserts! (is-eq tx-sender (get owner asset)) err-unauthorized)
    (asserts! (get active asset) err-invalid-params)
    (map-set licenses {license-id: license-id}
      {
        asset-id: asset-id,
        licensee: licensee,
        duration-blocks: duration-blocks,
        fee: fee,
        granted-at: stacks-block-height,
        expires-at: (+ stacks-block-height duration-blocks),
        status: "active"
      }
    )
    (var-set license-nonce (+ license-id u1))
    (ok license-id)
  )
)

(define-public (pay-royalty (asset-id uint) (amount uint))
  (let (
    (asset (unwrap! (map-get? ip-assets {asset-id: asset-id}) err-not-found))
    (payment-id (var-get payment-nonce))
  )
    (map-set royalty-payments {payment-id: payment-id}
      {
        asset-id: asset-id,
        payer: tx-sender,
        amount: amount,
        timestamp: stacks-block-height
      }
    )
    (var-set payment-nonce (+ payment-id u1))
    (ok payment-id)
  )
)
