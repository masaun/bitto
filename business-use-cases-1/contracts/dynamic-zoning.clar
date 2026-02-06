(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-zone-not-found (err u102))

(define-map zones uint {
  location: (string-ascii 100),
  current-use: (string-ascii 50),
  allowed-uses: (list 10 (string-ascii 50)),
  density-limit: uint,
  height-limit: uint,
  active: bool
})

(define-map zone-metrics {zone-id: uint, metric-type: (string-ascii 50)} uint)

(define-data-var zone-nonce uint u0)

(define-read-only (get-zone (zone-id uint))
  (ok (map-get? zones zone-id)))

(define-read-only (get-zone-metric (zone-id uint) (metric-type (string-ascii 50)))
  (ok (map-get? zone-metrics {zone-id: zone-id, metric-type: metric-type})))

(define-public (create-zone (location (string-ascii 100)) (current-use (string-ascii 50)) (allowed-uses (list 10 (string-ascii 50))) (density-limit uint) (height-limit uint))
  (let ((zone-id (+ (var-get zone-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set zones zone-id {
      location: location,
      current-use: current-use,
      allowed-uses: allowed-uses,
      density-limit: density-limit,
      height-limit: height-limit,
      active: true
    })
    (var-set zone-nonce zone-id)
    (ok zone-id)))

(define-public (update-zone-metrics (zone-id uint) (metric-type (string-ascii 50)) (value uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set zone-metrics {zone-id: zone-id, metric-type: metric-type} value))))

(define-public (adjust-zone-parameters (zone-id uint) (density-limit uint) (height-limit uint))
  (let ((zone (unwrap! (map-get? zones zone-id) err-zone-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set zones zone-id 
      (merge zone {density-limit: density-limit, height-limit: height-limit})))))

(define-public (update-allowed-uses (zone-id uint) (allowed-uses (list 10 (string-ascii 50))))
  (let ((zone (unwrap! (map-get? zones zone-id) err-zone-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set zones zone-id (merge zone {allowed-uses: allowed-uses})))))
