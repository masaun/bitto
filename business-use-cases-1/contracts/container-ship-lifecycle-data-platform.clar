(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map vessel-lifecycle uint {
  vessel-imo: (string-ascii 20),
  owner: principal,
  build-date: uint,
  last-maintenance: uint,
  operating-hours: uint,
  fuel-consumption: uint,
  emissions: uint,
  status: (string-ascii 20)
})

(define-map maintenance-records uint {
  vessel-id: uint,
  maintenance-type: (string-ascii 100),
  performed-by: principal,
  cost: uint,
  timestamp: uint,
  next-due: uint
})

(define-data-var vessel-nonce uint u0)
(define-data-var maintenance-nonce uint u0)

(define-public (register-vessel-lifecycle (imo (string-ascii 20)) (build-date uint))
  (let ((id (+ (var-get vessel-nonce) u1)))
    (map-set vessel-lifecycle id {
      vessel-imo: imo,
      owner: tx-sender,
      build-date: build-date,
      last-maintenance: u0,
      operating-hours: u0,
      fuel-consumption: u0,
      emissions: u0,
      status: "active"
    })
    (var-set vessel-nonce id)
    (ok id)))

(define-public (record-maintenance (vessel-id uint) (mtype (string-ascii 100)) (cost uint) (next-due uint))
  (let ((vessel (unwrap! (map-get? vessel-lifecycle vessel-id) err-not-found))
        (id (+ (var-get maintenance-nonce) u1)))
    (asserts! (is-eq tx-sender (get owner vessel)) err-unauthorized)
    (map-set maintenance-records id {
      vessel-id: vessel-id,
      maintenance-type: mtype,
      performed-by: tx-sender,
      cost: cost,
      timestamp: block-height,
      next-due: next-due
    })
    (map-set vessel-lifecycle vessel-id (merge vessel {last-maintenance: block-height}))
    (var-set maintenance-nonce id)
    (ok id)))

(define-public (update-operations (vessel-id uint) (hours uint) (fuel uint) (emissions uint))
  (let ((vessel (unwrap! (map-get? vessel-lifecycle vessel-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner vessel)) err-unauthorized)
    (map-set vessel-lifecycle vessel-id (merge vessel {
      operating-hours: (+ (get operating-hours vessel) hours),
      fuel-consumption: (+ (get fuel-consumption vessel) fuel),
      emissions: (+ (get emissions vessel) emissions)
    }))
    (ok true)))

(define-read-only (get-vessel (id uint))
  (ok (map-get? vessel-lifecycle id)))

(define-read-only (get-maintenance (id uint))
  (ok (map-get? maintenance-records id)))
