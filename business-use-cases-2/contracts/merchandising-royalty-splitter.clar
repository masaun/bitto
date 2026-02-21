(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-split (err u102))
(define-constant err-invalid-amount (err u103))

(define-map products uint {name: (string-ascii 50), total-sales: uint})
(define-map royalty-splits {product-id: uint, beneficiary: principal} {percentage: uint, total-earned: uint})
(define-data-var product-nonce uint u0)
(define-data-var platform-cut uint u10)

(define-read-only (get-product (product-id uint))
  (map-get? products product-id))

(define-read-only (get-split (product-id uint) (beneficiary principal))
  (map-get? royalty-splits {product-id: product-id, beneficiary: beneficiary}))

(define-read-only (get-platform-cut)
  (ok (var-get platform-cut)))

(define-public (register-product (name (string-ascii 50)))
  (let ((product-id (+ (var-get product-nonce) u1)))
    (map-set products product-id {name: name, total-sales: u0})
    (var-set product-nonce product-id)
    (ok product-id)))

(define-public (set-royalty-split (product-id uint) (beneficiary principal) (percentage uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= percentage u100) err-invalid-split)
    (map-set royalty-splits {product-id: product-id, beneficiary: beneficiary} {percentage: percentage, total-earned: u0})
    (ok true)))

(define-public (record-sale (product-id uint) (amount uint))
  (let ((product (unwrap! (map-get? products product-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set products product-id {name: (get name product), total-sales: (+ (get total-sales product) amount)})
    (ok true)))

(define-public (distribute-royalty (product-id uint) (beneficiary principal) (amount uint))
  (let ((split (unwrap! (map-get? royalty-splits {product-id: product-id, beneficiary: beneficiary}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set royalty-splits {product-id: product-id, beneficiary: beneficiary} 
      {percentage: (get percentage split), total-earned: (+ (get total-earned split) amount)})
    (ok true)))

(define-public (update-platform-cut (new-cut uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set platform-cut new-cut)
    (ok true)))
