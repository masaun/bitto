(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-contract-not-found (err u102))

(define-map procurement-contracts uint {
  title: (string-ascii 100),
  agency: principal,
  vendor: (optional principal),
  budget: uint,
  requirements: (string-ascii 500),
  status: (string-ascii 20),
  created-at: uint,
  awarded-at: (optional uint)
})

(define-map bids {contract-id: uint, bidder: principal} {
  amount: uint,
  proposal: (string-ascii 500),
  timestamp: uint
})

(define-map vendor-ratings principal {
  total-contracts: uint,
  successful-contracts: uint,
  average-rating: uint
})

(define-data-var contract-nonce uint u0)

(define-read-only (get-contract (contract-id uint))
  (ok (map-get? procurement-contracts contract-id)))

(define-read-only (get-bid (contract-id uint) (bidder principal))
  (ok (map-get? bids {contract-id: contract-id, bidder: bidder})))

(define-read-only (get-vendor-rating (vendor principal))
  (ok (map-get? vendor-ratings vendor)))

(define-public (create-contract (title (string-ascii 100)) (budget uint) (requirements (string-ascii 500)))
  (let ((contract-id (+ (var-get contract-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set procurement-contracts contract-id {
      title: title,
      agency: tx-sender,
      vendor: none,
      budget: budget,
      requirements: requirements,
      status: "open",
      created-at: stacks-stacks-block-height,
      awarded-at: none
    })
    (var-set contract-nonce contract-id)
    (ok contract-id)))

(define-public (submit-bid (contract-id uint) (amount uint) (proposal (string-ascii 500)))
  (let ((contract (unwrap! (map-get? procurement-contracts contract-id) err-contract-not-found)))
    (asserts! (is-eq (get status contract) "open") err-not-authorized)
    (ok (map-set bids {contract-id: contract-id, bidder: tx-sender} {
      amount: amount,
      proposal: proposal,
      timestamp: stacks-stacks-block-height
    }))))

(define-public (award-contract (contract-id uint) (vendor principal))
  (let ((contract (unwrap! (map-get? procurement-contracts contract-id) err-contract-not-found)))
    (asserts! (is-eq tx-sender (get agency contract)) err-not-authorized)
    (asserts! (is-eq (get status contract) "open") err-not-authorized)
    (ok (map-set procurement-contracts contract-id {
      title: (get title contract),
      agency: (get agency contract),
      vendor: (some vendor),
      budget: (get budget contract),
      requirements: (get requirements contract),
      status: "awarded",
      created-at: (get created-at contract),
      awarded-at: (some stacks-stacks-block-height)
    }))))

(define-public (complete-contract (contract-id uint))
  (let ((contract (unwrap! (map-get? procurement-contracts contract-id) err-contract-not-found)))
    (asserts! (is-eq tx-sender (get agency contract)) err-not-authorized)
    (asserts! (is-eq (get status contract) "awarded") err-not-authorized)
    (ok (map-set procurement-contracts contract-id 
      (merge contract {status: "completed"})))))

(define-public (rate-vendor (vendor principal) (rating uint))
  (let ((vendor-data (default-to {total-contracts: u0, successful-contracts: u0, average-rating: u0} (map-get? vendor-ratings vendor))))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (let (
      (new-total (+ (get total-contracts vendor-data) u1))
      (new-successful (+ (get successful-contracts vendor-data) u1))
      (new-avg (/ (+ (* (get average-rating vendor-data) (get total-contracts vendor-data)) rating) new-total))
    )
      (ok (map-set vendor-ratings vendor {
        total-contracts: new-total,
        successful-contracts: new-successful,
        average-rating: new-avg
      })))))
