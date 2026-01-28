(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map crop-sensors uint {
  sensor-id: (string-ascii 50),
  farm-id: uint,
  crop-type: (string-ascii 50),
  location: (string-ascii 100),
  owner: principal,
  active: bool
})

(define-map sensor-readings {sensor-id: uint, timestamp: uint} {
  growth-stage: uint,
  health-index: uint,
  pest-detection: bool,
  disease-risk: uint,
  nutrient-level: uint
})

(define-data-var sensor-nonce uint u0)

(define-public (register-crop-sensor (sensor-id (string-ascii 50)) (farm-id uint) (crop (string-ascii 50)) (loc (string-ascii 100)))
  (let ((id (+ (var-get sensor-nonce) u1)))
    (map-set crop-sensors id {
      sensor-id: sensor-id,
      farm-id: farm-id,
      crop-type: crop,
      location: loc,
      owner: tx-sender,
      active: true
    })
    (var-set sensor-nonce id)
    (ok id)))

(define-public (record-crop-reading (sensor-id uint) (growth uint) (health uint) (pest bool) (disease uint) (nutrient uint))
  (let ((sensor (unwrap! (map-get? crop-sensors sensor-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner sensor)) err-unauthorized)
    (map-set sensor-readings {sensor-id: sensor-id, timestamp: block-height} {
      growth-stage: growth,
      health-index: health,
      pest-detection: pest,
      disease-risk: disease,
      nutrient-level: nutrient
    })
    (ok true)))

(define-public (deactivate-sensor (sensor-id uint))
  (let ((sensor (unwrap! (map-get? crop-sensors sensor-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner sensor)) err-unauthorized)
    (map-set crop-sensors sensor-id (merge sensor {active: false}))
    (ok true)))

(define-read-only (get-sensor (id uint))
  (ok (map-get? crop-sensors id)))

(define-read-only (get-reading (sensor-id uint) (timestamp uint))
  (ok (map-get? sensor-readings {sensor-id: sensor-id, timestamp: timestamp})))
