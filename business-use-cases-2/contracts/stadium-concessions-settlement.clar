(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-amount (err u103))

(define-map vendors principal {name: (string-ascii 50), verified: bool, total-sales: uint})
(define-map sales {vendor: principal, event-id: uint} {amount: uint, settled: bool, timestamp: uint})
(define-data-var total-revenue uint u0)
(define-data-var settlement-fee uint u30)

(define-read-only (get-vendor (vendor principal))
  (map-get? vendors vendor))

(define-read-only (get-sale (vendor principal) (event-id uint))
  (map-get? sales {vendor: vendor, event-id: event-id}))

(define-read-only (get-total-revenue)
  (ok (var-get total-revenue)))

(define-public (register-vendor (name (string-ascii 50)))
  (begin
    (map-set vendors tx-sender {name: name, verified: false, total-sales: u0})
    (ok true)))

(define-public (verify-vendor (vendor principal))
  (let ((vendor-data (unwrap! (map-get? vendors vendor) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set vendors vendor (merge vendor-data {verified: true}))
    (ok true)))

(define-public (record-sale (event-id uint) (amount uint))
  (let ((vendor-data (unwrap! (map-get? vendors tx-sender) err-not-found)))
    (asserts! (get verified vendor-data) err-owner-only)
    (map-set sales {vendor: tx-sender, event-id: event-id} {amount: amount, settled: false, timestamp: burn-block-height})
    (map-set vendors tx-sender (merge vendor-data {total-sales: (+ (get total-sales vendor-data) amount)}))
    (var-set total-revenue (+ (var-get total-revenue) amount))
    (ok true)))

(define-public (settle-payment (vendor principal) (event-id uint))
  (let ((sale (unwrap! (map-get? sales {vendor: vendor, event-id: event-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (get settled sale)) err-not-found)
    (map-set sales {vendor: vendor, event-id: event-id} (merge sale {settled: true}))
    (ok true)))

(define-public (update-settlement-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set settlement-fee new-fee)
    (ok true)))
