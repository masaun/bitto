(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map satellite-devices uint {
  device-id: (string-ascii 50),
  device-type: (string-ascii 50),
  owner: principal,
  latitude: int,
  longitude: int,
  active: bool,
  last-connection: uint
})

(define-map satellite-data {device-id: uint, timestamp: uint} {
  data-payload: (string-ascii 500),
  signal-strength: uint,
  battery-level: uint,
  data-type: (string-ascii 50)
})

(define-data-var device-nonce uint u0)

(define-public (register-satellite-device (device-id (string-ascii 50)) (dtype (string-ascii 50)) (lat int) (lon int))
  (let ((id (+ (var-get device-nonce) u1)))
    (map-set satellite-devices id {
      device-id: device-id,
      device-type: dtype,
      owner: tx-sender,
      latitude: lat,
      longitude: lon,
      active: true,
      last-connection: block-height
    })
    (var-set device-nonce id)
    (ok id)))

(define-public (transmit-data (device-id uint) (payload (string-ascii 500)) (signal uint) (battery uint) (dtype (string-ascii 50)))
  (let ((device (unwrap! (map-get? satellite-devices device-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner device)) err-unauthorized)
    (map-set satellite-data {device-id: device-id, timestamp: block-height} {
      data-payload: payload,
      signal-strength: signal,
      battery-level: battery,
      data-type: dtype
    })
    (map-set satellite-devices device-id (merge device {last-connection: block-height}))
    (ok true)))

(define-public (update-device-status (device-id uint) (active bool))
  (let ((device (unwrap! (map-get? satellite-devices device-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner device)) err-unauthorized)
    (map-set satellite-devices device-id (merge device {active: active}))
    (ok true)))

(define-read-only (get-device (id uint))
  (ok (map-get? satellite-devices id)))

(define-read-only (get-data (device-id uint) (timestamp uint))
  (ok (map-get? satellite-data {device-id: device-id, timestamp: timestamp})))
