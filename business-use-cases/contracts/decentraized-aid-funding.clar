(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map funding-campaigns
  {campaign-id: uint}
  {
    title: (string-ascii 256),
    target-amount: uint,
    raised-amount: uint,
    recipient-organization: principal,
    campaign-type: (string-ascii 64),
    status: (string-ascii 16),
    created-at: uint,
    ends-at: uint
  }
)

(define-map contributions
  {contribution-id: uint}
  {
    campaign-id: uint,
    contributor: principal,
    amount: uint,
    timestamp: uint,
    anonymous: bool
  }
)

(define-data-var campaign-nonce uint u0)
(define-data-var contribution-nonce uint u0)

(define-read-only (get-campaign (campaign-id uint))
  (map-get? funding-campaigns {campaign-id: campaign-id})
)

(define-read-only (get-contribution (contribution-id uint))
  (map-get? contributions {contribution-id: contribution-id})
)

(define-public (create-campaign
  (title (string-ascii 256))
  (target-amount uint)
  (recipient-organization principal)
  (campaign-type (string-ascii 64))
  (duration uint)
)
  (let ((campaign-id (var-get campaign-nonce)))
    (asserts! (> target-amount u0) err-invalid-params)
    (map-set funding-campaigns {campaign-id: campaign-id}
      {
        title: title,
        target-amount: target-amount,
        raised-amount: u0,
        recipient-organization: recipient-organization,
        campaign-type: campaign-type,
        status: "active",
        created-at: stacks-block-height,
        ends-at: (+ stacks-block-height duration)
      }
    )
    (var-set campaign-nonce (+ campaign-id u1))
    (ok campaign-id)
  )
)

(define-public (contribute
  (campaign-id uint)
  (amount uint)
  (anonymous bool)
)
  (let (
    (campaign (unwrap! (map-get? funding-campaigns {campaign-id: campaign-id}) err-not-found))
    (contribution-id (var-get contribution-nonce))
  )
    (asserts! (is-eq (get status campaign) "active") err-invalid-params)
    (asserts! (< stacks-block-height (get ends-at campaign)) err-invalid-params)
    (asserts! (> amount u0) err-invalid-params)
    (map-set contributions {contribution-id: contribution-id}
      {
        campaign-id: campaign-id,
        contributor: tx-sender,
        amount: amount,
        timestamp: stacks-block-height,
        anonymous: anonymous
      }
    )
    (map-set funding-campaigns {campaign-id: campaign-id}
      (merge campaign {raised-amount: (+ (get raised-amount campaign) amount)})
    )
    (var-set contribution-nonce (+ contribution-id u1))
    (ok contribution-id)
  )
)

(define-public (finalize-campaign (campaign-id uint))
  (let ((campaign (unwrap! (map-get? funding-campaigns {campaign-id: campaign-id}) err-not-found)))
    (asserts! (>= stacks-block-height (get ends-at campaign)) err-invalid-params)
    (ok (map-set funding-campaigns {campaign-id: campaign-id}
      (merge campaign {
        status: (if (>= (get raised-amount campaign) (get target-amount campaign)) "successful" "failed")
      })
    ))
  )
)
