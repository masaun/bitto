(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map leasebacks uint {
  asset-id: (string-ascii 64),
  seller: principal,
  buyer: principal,
  sale-price: uint,
  lease-rate: uint,
  term: uint,
  status: (string-ascii 20),
  created-at: uint
})

(define-data-var leaseback-nonce uint u0)

(define-public (originate-leaseback (asset-id (string-ascii 64)) (buyer principal) (sale-price uint) (lease-rate uint) (term uint))
  (let ((lb-id (var-get leaseback-nonce)))
    (asserts! (> sale-price u0) err-invalid-params)
    (asserts! (> lease-rate u0) err-invalid-params)
    (map-set leasebacks lb-id {
      asset-id: asset-id,
      seller: tx-sender,
      buyer: buyer,
      sale-price: sale-price,
      lease-rate: lease-rate,
      term: term,
      status: "pending",
      created-at: stacks-block-height
    })
    (var-set leaseback-nonce (+ lb-id u1))
    (ok lb-id)))

(define-public (approve-leaseback (lb-id uint))
  (let ((lb (unwrap! (map-get? leasebacks lb-id) err-not-found)))
    (asserts! (is-eq tx-sender (get buyer lb)) err-unauthorized)
    (asserts! (is-eq (get status lb) "pending") err-invalid-params)
    (ok (map-set leasebacks lb-id (merge lb {status: "active"})))))

(define-public (settle-leaseback (lb-id uint))
  (let ((lb (unwrap! (map-get? leasebacks lb-id) err-not-found)))
    (asserts! (or (is-eq tx-sender (get seller lb)) (is-eq tx-sender (get buyer lb))) err-unauthorized)
    (ok (map-set leasebacks lb-id (merge lb {status: "settled"})))))

(define-public (terminate-leaseback (lb-id uint))
  (let ((lb (unwrap! (map-get? leasebacks lb-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set leasebacks lb-id (merge lb {status: "terminated"})))))

(define-read-only (get-leaseback (lb-id uint))
  (ok (map-get? leasebacks lb-id)))

(define-read-only (get-leaseback-count)
  (ok (var-get leaseback-nonce)))
