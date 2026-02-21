(define-constant contract-owner tx-sender)
(define-constant err-not-found (err u101))

(define-map sensors (string-ascii 64) {owner: principal, location: (string-ascii 64), sensor-type: (string-ascii 32), active: bool})
(define-map sensor-readings uint {sensor-id: (string-ascii 64), value: uint, unit: (string-ascii 16), timestamp: uint})
(define-data-var reading-nonce uint u0)

(define-public (register-sensor (sensor-id (string-ascii 64)) (location (string-ascii 64)) (sensor-type (string-ascii 32)))
  (ok (map-set sensors sensor-id {owner: tx-sender, location: location, sensor-type: sensor-type, active: true})))

(define-public (submit-reading (sensor-id (string-ascii 64)) (value uint) (unit (string-ascii 16)))
  (let ((id (var-get reading-nonce)))
    (map-set sensor-readings id {sensor-id: sensor-id, value: value, unit: unit, timestamp: stacks-block-height})
    (var-set reading-nonce (+ id u1))
    (ok id)))

(define-read-only (get-sensor (sensor-id (string-ascii 64)))
  (ok (map-get? sensors sensor-id)))

(define-read-only (get-reading (reading-id uint))
  (ok (map-get? sensor-readings reading-id)))
