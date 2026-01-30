(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map iot-devices
  { device-id: uint }
  {
    device-type: (string-ascii 50),
    location: (string-ascii 100),
    status: (string-ascii 20),
    registered-at: uint
  }
)

(define-data-var device-nonce uint u0)

(define-public (register-device (device-type (string-ascii 50)) (location (string-ascii 100)))
  (let ((device-id (+ (var-get device-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set iot-devices { device-id: device-id }
      {
        device-type: device-type,
        location: location,
        status: "active",
        registered-at: stacks-block-height
      }
    )
    (var-set device-nonce device-id)
    (ok device-id)
  )
)

(define-public (update-device-status (device-id uint) (status (string-ascii 20)))
  (let ((device (unwrap! (map-get? iot-devices { device-id: device-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set iot-devices { device-id: device-id } (merge device { status: status }))
    (ok true)
  )
)

(define-read-only (get-device (device-id uint))
  (ok (map-get? iot-devices { device-id: device-id }))
)

(define-read-only (get-device-count)
  (ok (var-get device-nonce))
)
