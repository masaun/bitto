(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map ship-assets uint {
  vessel-name: (string-ascii 100),
  imo-number: (string-ascii 20),
  owner: principal,
  vessel-value: uint,
  built-year: uint,
  capacity-teu: uint,
  available-for-lease: bool
})

(define-map lease-agreements uint {
  vessel-id: uint,
  lessor: principal,
  lessee: principal,
  monthly-rate: uint,
  lease-term: uint,
  start-date: uint,
  end-date: uint,
  active: bool
})

(define-data-var vessel-nonce uint u0)
(define-data-var lease-nonce uint u0)

(define-public (register-vessel (name (string-ascii 100)) (imo (string-ascii 20)) (value uint) (year uint) (teu uint))
  (let ((id (+ (var-get vessel-nonce) u1)))
    (map-set ship-assets id {
      vessel-name: name,
      imo-number: imo,
      owner: tx-sender,
      vessel-value: value,
      built-year: year,
      capacity-teu: teu,
      available-for-lease: true
    })
    (var-set vessel-nonce id)
    (ok id)))

(define-public (create-lease (vessel-id uint) (lessee principal) (rate uint) (term uint))
  (let ((vessel (unwrap! (map-get? ship-assets vessel-id) err-not-found))
        (id (+ (var-get lease-nonce) u1)))
    (asserts! (is-eq tx-sender (get owner vessel)) err-unauthorized)
    (map-set lease-agreements id {
      vessel-id: vessel-id,
      lessor: tx-sender,
      lessee: lessee,
      monthly-rate: rate,
      lease-term: term,
      start-date: block-height,
      end-date: (+ block-height term),
      active: true
    })
    (map-set ship-assets vessel-id (merge vessel {available-for-lease: false}))
    (var-set lease-nonce id)
    (ok id)))

(define-public (terminate-lease (lease-id uint))
  (let ((lease (unwrap! (map-get? lease-agreements lease-id) err-not-found))
        (vessel (unwrap! (map-get? ship-assets (get vessel-id lease)) err-not-found)))
    (asserts! (or (is-eq tx-sender (get lessor lease))
                  (is-eq tx-sender (get lessee lease))) err-unauthorized)
    (map-set lease-agreements lease-id (merge lease {active: false}))
    (map-set ship-assets (get vessel-id lease) (merge vessel {available-for-lease: true}))
    (ok true)))

(define-read-only (get-vessel (id uint))
  (ok (map-get? ship-assets id)))

(define-read-only (get-lease (id uint))
  (ok (map-get? lease-agreements id)))
