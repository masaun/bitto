(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))
(define-constant err-insufficient-capacity (err u104))

(define-map storage-tanks
  {tank-id: uint}
  {
    location: (string-ascii 128),
    capacity: uint,
    current-volume: uint,
    operator: principal,
    temperature: int,
    pressure: uint,
    active: bool
  }
)

(define-map shipments
  {shipment-id: uint}
  {
    origin: (string-ascii 128),
    destination: (string-ascii 128),
    volume: uint,
    shipper: principal,
    status: (string-ascii 32),
    departure-date: uint,
    arrival-date: (optional uint),
    vessel-id: (string-ascii 64)
  }
)

(define-map inventory-transactions
  {tx-id: uint}
  {
    tank-id: uint,
    transaction-type: (string-ascii 16),
    volume: uint,
    timestamp: uint,
    initiated-by: principal,
    reference-id: (optional uint)
  }
)

(define-data-var tank-nonce uint u0)
(define-data-var shipment-nonce uint u0)
(define-data-var transaction-nonce uint u0)

(define-read-only (get-tank (tank-id uint))
  (map-get? storage-tanks {tank-id: tank-id})
)

(define-read-only (get-shipment (shipment-id uint))
  (map-get? shipments {shipment-id: shipment-id})
)

(define-read-only (get-transaction (tx-id uint))
  (map-get? inventory-transactions {tx-id: tx-id})
)

(define-public (register-tank
  (location (string-ascii 128))
  (capacity uint)
  (temperature int)
  (pressure uint)
)
  (let ((tank-id (var-get tank-nonce)))
    (asserts! (> capacity u0) err-invalid-params)
    (map-set storage-tanks {tank-id: tank-id}
      {
        location: location,
        capacity: capacity,
        current-volume: u0,
        operator: tx-sender,
        temperature: temperature,
        pressure: pressure,
        active: true
      }
    )
    (var-set tank-nonce (+ tank-id u1))
    (ok tank-id)
  )
)

(define-public (add-inventory
  (tank-id uint)
  (volume uint)
  (reference-id (optional uint))
)
  (let (
    (tank (unwrap! (map-get? storage-tanks {tank-id: tank-id}) err-not-found))
    (tx-id (var-get transaction-nonce))
  )
    (asserts! (get active tank) err-unauthorized)
    (asserts! (<= (+ (get current-volume tank) volume) (get capacity tank)) err-insufficient-capacity)
    (map-set storage-tanks {tank-id: tank-id}
      (merge tank {current-volume: (+ (get current-volume tank) volume)})
    )
    (map-set inventory-transactions {tx-id: tx-id}
      {
        tank-id: tank-id,
        transaction-type: "add",
        volume: volume,
        timestamp: stacks-block-height,
        initiated-by: tx-sender,
        reference-id: reference-id
      }
    )
    (var-set transaction-nonce (+ tx-id u1))
    (ok tx-id)
  )
)

(define-public (remove-inventory
  (tank-id uint)
  (volume uint)
  (reference-id (optional uint))
)
  (let (
    (tank (unwrap! (map-get? storage-tanks {tank-id: tank-id}) err-not-found))
    (tx-id (var-get transaction-nonce))
  )
    (asserts! (is-eq tx-sender (get operator tank)) err-unauthorized)
    (asserts! (<= volume (get current-volume tank)) err-invalid-params)
    (map-set storage-tanks {tank-id: tank-id}
      (merge tank {current-volume: (- (get current-volume tank) volume)})
    )
    (map-set inventory-transactions {tx-id: tx-id}
      {
        tank-id: tank-id,
        transaction-type: "remove",
        volume: volume,
        timestamp: stacks-block-height,
        initiated-by: tx-sender,
        reference-id: reference-id
      }
    )
    (var-set transaction-nonce (+ tx-id u1))
    (ok tx-id)
  )
)

(define-public (create-shipment
  (origin (string-ascii 128))
  (destination (string-ascii 128))
  (volume uint)
  (vessel-id (string-ascii 64))
)
  (let ((shipment-id (var-get shipment-nonce)))
    (asserts! (> volume u0) err-invalid-params)
    (map-set shipments {shipment-id: shipment-id}
      {
        origin: origin,
        destination: destination,
        volume: volume,
        shipper: tx-sender,
        status: "scheduled",
        departure-date: stacks-block-height,
        arrival-date: none,
        vessel-id: vessel-id
      }
    )
    (var-set shipment-nonce (+ shipment-id u1))
    (ok shipment-id)
  )
)

(define-public (update-shipment-status
  (shipment-id uint)
  (new-status (string-ascii 32))
)
  (let ((shipment (unwrap! (map-get? shipments {shipment-id: shipment-id}) err-not-found)))
    (asserts! (is-eq tx-sender (get shipper shipment)) err-unauthorized)
    (ok (map-set shipments {shipment-id: shipment-id}
      (merge shipment {
        status: new-status,
        arrival-date: (if (is-eq new-status "delivered") (some stacks-block-height) (get arrival-date shipment))
      })
    ))
  )
)
