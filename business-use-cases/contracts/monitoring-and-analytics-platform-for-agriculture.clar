(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map farm-data uint {
  farm-id: (string-ascii 50),
  owner: principal,
  total-area: uint,
  crop-type: (string-ascii 50),
  yield-prediction: uint,
  health-score: uint,
  last-updated: uint
})

(define-map analytics-metrics (string-ascii 50) {
  metric-value: uint,
  timestamp: uint,
  farm-id: uint
})

(define-data-var farm-nonce uint u0)

(define-public (register-farm (farm-id (string-ascii 50)) (area uint) (crop (string-ascii 50)))
  (let ((id (+ (var-get farm-nonce) u1)))
    (map-set farm-data id {
      farm-id: farm-id,
      owner: tx-sender,
      total-area: area,
      crop-type: crop,
      yield-prediction: u0,
      health-score: u100,
      last-updated: block-height
    })
    (var-set farm-nonce id)
    (ok id)))

(define-public (update-farm-metrics (id uint) (yield-pred uint) (health uint))
  (let ((farm (unwrap! (map-get? farm-data id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner farm)) err-unauthorized)
    (map-set farm-data id (merge farm {
      yield-prediction: yield-pred,
      health-score: health,
      last-updated: block-height
    }))
    (ok true)))

(define-public (record-metric (metric-name (string-ascii 50)) (value uint) (farm-id uint))
  (begin
    (map-set analytics-metrics metric-name {
      metric-value: value,
      timestamp: block-height,
      farm-id: farm-id
    })
    (ok true)))

(define-read-only (get-farm-data (id uint))
  (ok (map-get? farm-data id)))

(define-read-only (get-metric (metric-name (string-ascii 50)))
  (ok (map-get? analytics-metrics metric-name)))
