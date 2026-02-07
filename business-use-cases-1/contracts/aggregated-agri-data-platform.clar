(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map data-sources uint {
  source-name: (string-ascii 100),
  data-type: (string-ascii 50),
  provider: principal,
  active: bool,
  reliability-score: uint
})

(define-map aggregated-data (string-ascii 100) {
  data-value: (string-ascii 500),
  timestamp: uint,
  source-count: uint,
  confidence: uint
})

(define-data-var source-nonce uint u0)

(define-public (register-data-source (name (string-ascii 100)) (dtype (string-ascii 50)) (score uint))
  (let ((id (+ (var-get source-nonce) u1)))
    (map-set data-sources id {
      source-name: name,
      data-type: dtype,
      provider: tx-sender,
      active: true,
      reliability-score: score
    })
    (var-set source-nonce id)
    (ok id)))

(define-public (submit-aggregated-data (key (string-ascii 100)) (value (string-ascii 500)) (sources uint) (conf uint))
  (begin
    (map-set aggregated-data key {
      data-value: value,
      timestamp: block-height,
      source-count: sources,
      confidence: conf
    })
    (ok true)))

(define-public (update-source-status (source-id uint) (active bool))
  (let ((source (unwrap! (map-get? data-sources source-id) err-not-found)))
    (asserts! (is-eq tx-sender (get provider source)) err-unauthorized)
    (map-set data-sources source-id (merge source {active: active}))
    (ok true)))

(define-read-only (get-data-source (id uint))
  (ok (map-get? data-sources id)))

(define-read-only (get-aggregated-data (key (string-ascii 100)))
  (ok (map-get? aggregated-data key)))
