(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map soil-sensors uint {
  sensor-id: (string-ascii 50),
  farm-id: uint,
  depth: uint,
  location: (string-ascii 100),
  owner: principal,
  active: bool
})

(define-map soil-readings {sensor-id: uint, timestamp: uint} {
  moisture: uint,
  ph-level: uint,
  nitrogen: uint,
  phosphorus: uint,
  potassium: uint,
  temperature: int,
  ec-level: uint
})

(define-data-var sensor-nonce uint u0)

(define-public (register-soil-sensor (sensor-id (string-ascii 50)) (farm-id uint) (depth uint) (loc (string-ascii 100)))
  (let ((id (+ (var-get sensor-nonce) u1)))
    (map-set soil-sensors id {
      sensor-id: sensor-id,
      farm-id: farm-id,
      depth: depth,
      location: loc,
      owner: tx-sender,
      active: true
    })
    (var-set sensor-nonce id)
    (ok id)))

(define-public (record-soil-data (sensor-id uint) (moist uint) (ph uint) (n uint) (p uint) (k uint) (temp int) (ec uint))
  (let ((sensor (unwrap! (map-get? soil-sensors sensor-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner sensor)) err-unauthorized)
    (map-set soil-readings {sensor-id: sensor-id, timestamp: block-height} {
      moisture: moist,
      ph-level: ph,
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      temperature: temp,
      ec-level: ec
    })
    (ok true)))

(define-public (set-sensor-active (sensor-id uint) (active bool))
  (let ((sensor (unwrap! (map-get? soil-sensors sensor-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner sensor)) err-unauthorized)
    (map-set soil-sensors sensor-id (merge sensor {active: active}))
    (ok true)))

(define-read-only (get-sensor (id uint))
  (ok (map-get? soil-sensors id)))

(define-read-only (get-soil-reading (sensor-id uint) (timestamp uint))
  (ok (map-get? soil-readings {sensor-id: sensor-id, timestamp: timestamp})))
