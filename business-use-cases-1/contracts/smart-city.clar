(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-resource-not-found (err u102))

(define-map infrastructure uint {
  type: (string-ascii 50),
  location: (string-ascii 100),
  capacity: uint,
  utilization: uint,
  status: (string-ascii 20)
})

(define-map services uint {
  name: (string-ascii 100),
  provider: principal,
  cost: uint,
  active: bool
})

(define-map iot-sensors uint {
  location: (string-ascii 100),
  sensor-type: (string-ascii 50),
  last-reading: uint,
  status: (string-ascii 20)
})

(define-data-var infra-nonce uint u0)
(define-data-var service-nonce uint u0)
(define-data-var sensor-nonce uint u0)

(define-read-only (get-infrastructure (id uint))
  (ok (map-get? infrastructure id)))

(define-read-only (get-service (id uint))
  (ok (map-get? services id)))

(define-read-only (get-sensor (id uint))
  (ok (map-get? iot-sensors id)))

(define-public (register-infrastructure (type (string-ascii 50)) (location (string-ascii 100)) (capacity uint))
  (let ((id (+ (var-get infra-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set infrastructure id {
      type: type,
      location: location,
      capacity: capacity,
      utilization: u0,
      status: "active"
    })
    (var-set infra-nonce id)
    (ok id)))

(define-public (register-service (name (string-ascii 100)) (cost uint))
  (let ((id (+ (var-get service-nonce) u1)))
    (map-set services id {
      name: name,
      provider: tx-sender,
      cost: cost,
      active: true
    })
    (var-set service-nonce id)
    (ok id)))

(define-public (register-sensor (location (string-ascii 100)) (sensor-type (string-ascii 50)))
  (let ((id (+ (var-get sensor-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set iot-sensors id {
      location: location,
      sensor-type: sensor-type,
      last-reading: u0,
      status: "active"
    })
    (var-set sensor-nonce id)
    (ok id)))

(define-public (update-utilization (id uint) (utilization uint))
  (let ((infra (unwrap! (map-get? infrastructure id) err-resource-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set infrastructure id (merge infra {utilization: utilization})))))

(define-public (update-sensor-reading (id uint) (reading uint))
  (let ((sensor (unwrap! (map-get? iot-sensors id) err-resource-not-found)))
    (ok (map-set iot-sensors id (merge sensor {last-reading: reading})))))
