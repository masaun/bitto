(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map vessel-registry uint {
  vessel-imo: (string-ascii 20),
  vessel-name: (string-ascii 100),
  owner: principal,
  flag-state: (string-ascii 50),
  built-year: uint,
  registered-at: uint
})

(define-map mortgage-records uint {
  vessel-id: uint,
  mortgagee: principal,
  mortgage-amount: uint,
  interest-rate: uint,
  priority: uint,
  registered-at: uint,
  discharged: bool
})

(define-data-var vessel-nonce uint u0)
(define-data-var mortgage-nonce uint u0)

(define-public (register-vessel (imo (string-ascii 20)) (name (string-ascii 100)) (flag (string-ascii 50)) (year uint))
  (let ((id (+ (var-get vessel-nonce) u1)))
    (map-set vessel-registry id {
      vessel-imo: imo,
      vessel-name: name,
      owner: tx-sender,
      flag-state: flag,
      built-year: year,
      registered-at: block-height
    })
    (var-set vessel-nonce id)
    (ok id)))

(define-public (register-mortgage (vessel-id uint) (mortgagee principal) (amount uint) (rate uint) (priority uint))
  (let ((vessel (unwrap! (map-get? vessel-registry vessel-id) err-not-found))
        (id (+ (var-get mortgage-nonce) u1)))
    (asserts! (is-eq tx-sender (get owner vessel)) err-unauthorized)
    (map-set mortgage-records id {
      vessel-id: vessel-id,
      mortgagee: mortgagee,
      mortgage-amount: amount,
      interest-rate: rate,
      priority: priority,
      registered-at: block-height,
      discharged: false
    })
    (var-set mortgage-nonce id)
    (ok id)))

(define-public (discharge-mortgage (mortgage-id uint))
  (let ((mortgage (unwrap! (map-get? mortgage-records mortgage-id) err-not-found))
        (vessel (unwrap! (map-get? vessel-registry (get vessel-id mortgage)) err-not-found)))
    (asserts! (is-eq tx-sender (get owner vessel)) err-unauthorized)
    (map-set mortgage-records mortgage-id (merge mortgage {discharged: true}))
    (ok true)))

(define-read-only (get-vessel (id uint))
  (ok (map-get? vessel-registry id)))

(define-read-only (get-mortgage (id uint))
  (ok (map-get? mortgage-records id)))
