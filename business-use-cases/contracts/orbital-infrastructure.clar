(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map satellites
  {satellite-id: uint}
  {
    orbital-slot: (string-ascii 64),
    altitude: uint,
    operator: principal,
    status: (string-ascii 16),
    launch-date: uint,
    capacity-gbps: uint,
    active: bool
  }
)

(define-map ground-stations
  {station-id: uint}
  {
    location: (string-ascii 128),
    operator: principal,
    connected-satellites: (list 10 uint),
    capacity: uint,
    active: bool
  }
)

(define-map orbital-slots
  {slot-id: (string-ascii 64)}
  {
    occupied: bool,
    satellite-id: (optional uint),
    reserved-by: (optional principal)
  }
)

(define-data-var satellite-nonce uint u0)
(define-data-var station-nonce uint u0)

(define-read-only (get-satellite (satellite-id uint))
  (map-get? satellites {satellite-id: satellite-id})
)

(define-read-only (get-ground-station (station-id uint))
  (map-get? ground-stations {station-id: station-id})
)

(define-read-only (get-orbital-slot (slot-id (string-ascii 64)))
  (map-get? orbital-slots {slot-id: slot-id})
)

(define-public (register-satellite
  (orbital-slot (string-ascii 64))
  (altitude uint)
  (capacity-gbps uint)
)
  (let (
    (satellite-id (var-get satellite-nonce))
    (slot (default-to {occupied: false, satellite-id: none, reserved-by: none}
      (map-get? orbital-slots {slot-id: orbital-slot})))
  )
    (asserts! (not (get occupied slot)) err-invalid-params)
    (map-set satellites {satellite-id: satellite-id}
      {
        orbital-slot: orbital-slot,
        altitude: altitude,
        operator: tx-sender,
        status: "operational",
        launch-date: stacks-block-height,
        capacity-gbps: capacity-gbps,
        active: true
      }
    )
    (map-set orbital-slots {slot-id: orbital-slot}
      {occupied: true, satellite-id: (some satellite-id), reserved-by: (some tx-sender)}
    )
    (var-set satellite-nonce (+ satellite-id u1))
    (ok satellite-id)
  )
)

(define-public (register-ground-station
  (location (string-ascii 128))
  (capacity uint)
)
  (let ((station-id (var-get station-nonce)))
    (map-set ground-stations {station-id: station-id}
      {
        location: location,
        operator: tx-sender,
        connected-satellites: (list),
        capacity: capacity,
        active: true
      }
    )
    (var-set station-nonce (+ station-id u1))
    (ok station-id)
  )
)

(define-public (update-satellite-status
  (satellite-id uint)
  (new-status (string-ascii 16))
)
  (let ((satellite (unwrap! (map-get? satellites {satellite-id: satellite-id}) err-not-found)))
    (asserts! (is-eq tx-sender (get operator satellite)) err-unauthorized)
    (ok (map-set satellites {satellite-id: satellite-id}
      (merge satellite {status: new-status})
    ))
  )
)

(define-public (decommission-satellite (satellite-id uint))
  (let ((satellite (unwrap! (map-get? satellites {satellite-id: satellite-id}) err-not-found)))
    (asserts! (is-eq tx-sender (get operator satellite)) err-unauthorized)
    (map-set satellites {satellite-id: satellite-id}
      (merge satellite {active: false, status: "decommissioned"})
    )
    (ok (map-set orbital-slots {slot-id: (get orbital-slot satellite)}
      {occupied: false, satellite-id: none, reserved-by: none}
    ))
  )
)
