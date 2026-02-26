(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map weather-sensors uint {
  sensor-id: (string-ascii 50),
  location: (string-ascii 100),
  latitude: int,
  longitude: int,
  owner: principal,
  active: bool
})

(define-map weather-data {sensor-id: uint, timestamp: uint} {
  temperature: int,
  humidity: uint,
  rainfall: uint,
  wind-speed: uint,
  pressure: uint,
  uv-index: uint
})

(define-data-var sensor-nonce uint u0)

(define-public (register-weather-sensor (sensor-id (string-ascii 50)) (loc (string-ascii 100)) (lat int) (lon int))
  (let ((id (+ (var-get sensor-nonce) u1)))
    (map-set weather-sensors id {
      sensor-id: sensor-id,
      location: loc,
      latitude: lat,
      longitude: lon,
      owner: tx-sender,
      active: true
    })
    (var-set sensor-nonce id)
    (ok id)))

(define-public (record-weather-data (sensor-id uint) (temp int) (humid uint) (rain uint) (wind uint) (press uint) (uv uint))
  (let ((sensor (unwrap! (map-get? weather-sensors sensor-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner sensor)) err-unauthorized)
    (map-set weather-data {sensor-id: sensor-id, timestamp: block-height} {
      temperature: temp,
      humidity: humid,
      rainfall: rain,
      wind-speed: wind,
      pressure: press,
      uv-index: uv
    })
    (ok true)))

(define-public (toggle-sensor (sensor-id uint) (active bool))
  (let ((sensor (unwrap! (map-get? weather-sensors sensor-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner sensor)) err-unauthorized)
    (map-set weather-sensors sensor-id (merge sensor {active: active}))
    (ok true)))

(define-read-only (get-sensor (id uint))
  (ok (map-get? weather-sensors id)))

(define-read-only (get-weather-data (sensor-id uint) (timestamp uint))
  (ok (map-get? weather-data {sensor-id: sensor-id, timestamp: timestamp})))
