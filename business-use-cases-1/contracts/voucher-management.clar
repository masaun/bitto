(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map vouchers
  {voucher-id: uint}
  {
    beneficiary-did: (string-ascii 128),
    value: uint,
    voucher-type: (string-ascii 64),
    issued-by: principal,
    issued-at: uint,
    expires-at: uint,
    redeemed: bool,
    redeemed-at: (optional uint)
  }
)

(define-map merchants
  {merchant-id: principal}
  {
    name: (string-ascii 128),
    verified: bool,
    total-redemptions: uint
  }
)

(define-data-var voucher-nonce uint u0)

(define-read-only (get-voucher (voucher-id uint))
  (map-get? vouchers {voucher-id: voucher-id})
)

(define-read-only (get-merchant (merchant-id principal))
  (map-get? merchants {merchant-id: merchant-id})
)

(define-public (register-merchant (name (string-ascii 128)))
  (begin
    (ok (map-set merchants {merchant-id: tx-sender}
      {
        name: name,
        verified: false,
        total-redemptions: u0
      }
    ))
  )
)

(define-public (verify-merchant (merchant-id principal))
  (let ((merchant (unwrap! (map-get? merchants {merchant-id: merchant-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set merchants {merchant-id: merchant-id}
      (merge merchant {verified: true})
    ))
  )
)

(define-public (issue-voucher
  (beneficiary-did (string-ascii 128))
  (value uint)
  (voucher-type (string-ascii 64))
  (duration uint)
)
  (let ((voucher-id (var-get voucher-nonce)))
    (asserts! (> value u0) err-invalid-params)
    (map-set vouchers {voucher-id: voucher-id}
      {
        beneficiary-did: beneficiary-did,
        value: value,
        voucher-type: voucher-type,
        issued-by: tx-sender,
        issued-at: stacks-block-height,
        expires-at: (+ stacks-block-height duration),
        redeemed: false,
        redeemed-at: none
      }
    )
    (var-set voucher-nonce (+ voucher-id u1))
    (ok voucher-id)
  )
)

(define-public (redeem-voucher (voucher-id uint))
  (let (
    (voucher (unwrap! (map-get? vouchers {voucher-id: voucher-id}) err-not-found))
    (merchant (unwrap! (map-get? merchants {merchant-id: tx-sender}) err-not-found))
  )
    (asserts! (get verified merchant) err-unauthorized)
    (asserts! (not (get redeemed voucher)) err-invalid-params)
    (asserts! (< stacks-block-height (get expires-at voucher)) err-invalid-params)
    (map-set vouchers {voucher-id: voucher-id}
      (merge voucher {redeemed: true, redeemed-at: (some stacks-block-height)})
    )
    (ok (map-set merchants {merchant-id: tx-sender}
      (merge merchant {total-redemptions: (+ (get total-redemptions merchant) u1)})
    ))
  )
)
