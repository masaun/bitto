(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map dock-facilities uint {
  facility-name: (string-ascii 100),
  location: (string-ascii 100),
  owner: principal,
  total-capacity: uint,
  available-capacity: uint,
  supported-vessel-types: (string-ascii 200),
  active: bool
})

(define-map dock-reservations uint {
  facility-id: uint,
  user: principal,
  vessel-type: (string-ascii 50),
  start-date: uint,
  end-date: uint,
  purpose: (string-ascii 100),
  confirmed: bool
})

(define-data-var facility-nonce uint u0)
(define-data-var reservation-nonce uint u0)

(define-public (register-dock-facility (name (string-ascii 100)) (location (string-ascii 100)) (capacity uint) (vessel-types (string-ascii 200)))
  (let ((id (+ (var-get facility-nonce) u1)))
    (map-set dock-facilities id {
      facility-name: name,
      location: location,
      owner: tx-sender,
      total-capacity: capacity,
      available-capacity: capacity,
      supported-vessel-types: vessel-types,
      active: true
    })
    (var-set facility-nonce id)
    (ok id)))

(define-public (reserve-dock (facility-id uint) (vessel-type (string-ascii 50)) (start uint) (end uint) (purpose (string-ascii 100)))
  (let ((facility (unwrap! (map-get? dock-facilities facility-id) err-not-found))
        (id (+ (var-get reservation-nonce) u1)))
    (asserts! (> (get available-capacity facility) u0) err-unauthorized)
    (map-set dock-reservations id {
      facility-id: facility-id,
      user: tx-sender,
      vessel-type: vessel-type,
      start-date: start,
      end-date: end,
      purpose: purpose,
      confirmed: false
    })
    (var-set reservation-nonce id)
    (ok id)))

(define-public (confirm-reservation (reservation-id uint))
  (let ((reservation (unwrap! (map-get? dock-reservations reservation-id) err-not-found))
        (facility (unwrap! (map-get? dock-facilities (get facility-id reservation)) err-not-found)))
    (asserts! (is-eq tx-sender (get owner facility)) err-unauthorized)
    (map-set dock-reservations reservation-id (merge reservation {confirmed: true}))
    (map-set dock-facilities (get facility-id reservation) (merge facility {
      available-capacity: (- (get available-capacity facility) u1)
    }))
    (ok true)))

(define-read-only (get-facility (id uint))
  (ok (map-get? dock-facilities id)))

(define-read-only (get-reservation (id uint))
  (ok (map-get? dock-reservations id)))
