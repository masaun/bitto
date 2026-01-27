(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map scout-reports
  {report-id: uint}
  {
    player: principal,
    scout: principal,
    rating: uint,
    analysis-hash: (buff 32),
    timestamp: uint,
    verified: bool,
    price: uint
  }
)

(define-map report-purchases
  {purchase-id: uint}
  {
    report-id: uint,
    buyer: principal,
    price-paid: uint,
    timestamp: uint
  }
)

(define-map scouts
  {scout: principal}
  {
    verified: bool,
    total-reports: uint,
    rating: uint
  }
)

(define-data-var report-nonce uint u0)
(define-data-var purchase-nonce uint u0)

(define-read-only (get-report (report-id uint))
  (map-get? scout-reports {report-id: report-id})
)

(define-read-only (get-scout (scout principal))
  (map-get? scouts {scout: scout})
)

(define-public (register-scout)
  (ok (map-set scouts {scout: tx-sender}
    {
      verified: false,
      total-reports: u0,
      rating: u0
    }
  ))
)

(define-public (verify-scout (scout principal))
  (let ((scout-data (unwrap! (map-get? scouts {scout: scout}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set scouts {scout: scout}
      (merge scout-data {verified: true})
    ))
  )
)

(define-public (submit-report
  (player principal)
  (rating uint)
  (analysis-hash (buff 32))
  (price uint)
)
  (let (
    (scout-data (unwrap! (map-get? scouts {scout: tx-sender}) err-not-found))
    (report-id (var-get report-nonce))
  )
    (asserts! (get verified scout-data) err-unauthorized)
    (asserts! (<= rating u100) err-invalid-params)
    (map-set scout-reports {report-id: report-id}
      {
        player: player,
        scout: tx-sender,
        rating: rating,
        analysis-hash: analysis-hash,
        timestamp: stacks-block-height,
        verified: false,
        price: price
      }
    )
    (map-set scouts {scout: tx-sender}
      (merge scout-data {total-reports: (+ (get total-reports scout-data) u1)})
    )
    (var-set report-nonce (+ report-id u1))
    (ok report-id)
  )
)

(define-public (purchase-report (report-id uint))
  (let (
    (report (unwrap! (map-get? scout-reports {report-id: report-id}) err-not-found))
    (purchase-id (var-get purchase-nonce))
  )
    (map-set report-purchases {purchase-id: purchase-id}
      {
        report-id: report-id,
        buyer: tx-sender,
        price-paid: (get price report),
        timestamp: stacks-block-height
      }
    )
    (var-set purchase-nonce (+ purchase-id u1))
    (ok purchase-id)
  )
)
