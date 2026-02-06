(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)
(define-data-var valuation-nonce uint u0)

(define-map catalog-valuations
  uint
  {
    catalog-owner: principal,
    work-ids: (list 50 uint),
    valuation-amount: uint,
    valuation-method: (string-ascii 30),
    valuator: principal,
    valuation-date: uint,
    expires-at: uint,
    verified: bool
  }
)

(define-map revenue-history
  { catalog-id: uint, period: uint }
  {
    revenue: uint,
    expenses: uint,
    net-income: uint
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-valuation (valuation-id uint))
  (ok (map-get? catalog-valuations valuation-id))
)

(define-read-only (get-revenue-history (catalog-id uint) (period uint))
  (ok (map-get? revenue-history { catalog-id: catalog-id, period: period }))
)

(define-read-only (get-valuation-nonce)
  (ok (var-get valuation-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (submit-valuation
  (catalog-owner principal)
  (work-ids (list 50 uint))
  (valuation-amount uint)
  (valuation-method (string-ascii 30))
  (validity-blocks uint)
)
  (let ((valuation-id (+ (var-get valuation-nonce) u1)))
    (map-set catalog-valuations valuation-id {
      catalog-owner: catalog-owner,
      work-ids: work-ids,
      valuation-amount: valuation-amount,
      valuation-method: valuation-method,
      valuator: tx-sender,
      valuation-date: stacks-block-height,
      expires-at: (+ stacks-block-height validity-blocks),
      verified: false
    })
    (var-set valuation-nonce valuation-id)
    (ok valuation-id)
  )
)

(define-public (verify-valuation (valuation-id uint))
  (let ((valuation (unwrap! (map-get? catalog-valuations valuation-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set catalog-valuations valuation-id (merge valuation { verified: true })))
  )
)

(define-public (record-revenue
  (catalog-id uint)
  (period uint)
  (revenue uint)
  (expenses uint)
)
  (begin
    (ok (map-set revenue-history { catalog-id: catalog-id, period: period } {
      revenue: revenue,
      expenses: expenses,
      net-income: (- revenue expenses)
    }))
  )
)
