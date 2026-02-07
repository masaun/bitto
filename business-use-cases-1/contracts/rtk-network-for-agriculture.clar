(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-already-exists (err u103))

(define-map rtk-stations uint {
  location: (string-ascii 100),
  latitude: int,
  longitude: int,
  altitude: int,
  active: bool,
  owner: principal,
  accuracy: uint
})

(define-map farmer-subscriptions principal {
  station-id: uint,
  active: bool,
  expires-at: uint
})

(define-data-var station-nonce uint u0)

(define-public (register-rtk-station (location (string-ascii 100)) (lat int) (lon int) (alt int) (accuracy uint))
  (let ((station-id (+ (var-get station-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set rtk-stations station-id {
      location: location,
      latitude: lat,
      longitude: lon,
      altitude: alt,
      active: true,
      owner: tx-sender,
      accuracy: accuracy
    })
    (var-set station-nonce station-id)
    (ok station-id)))

(define-public (subscribe-to-station (station-id uint) (duration uint))
  (let ((station (unwrap! (map-get? rtk-stations station-id) err-not-found)))
    (map-set farmer-subscriptions tx-sender {
      station-id: station-id,
      active: true,
      expires-at: (+ block-height duration)
    })
    (ok true)))

(define-public (update-station-status (station-id uint) (active bool))
  (let ((station (unwrap! (map-get? rtk-stations station-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner station)) err-unauthorized)
    (map-set rtk-stations station-id (merge station {active: active}))
    (ok true)))

(define-read-only (get-station (station-id uint))
  (ok (map-get? rtk-stations station-id)))

(define-read-only (get-subscription (farmer principal))
  (ok (map-get? farmer-subscriptions farmer)))
