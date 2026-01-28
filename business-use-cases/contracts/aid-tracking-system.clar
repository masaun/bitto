(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map aid-shipments
  {shipment-id: uint}
  {
    program-id: uint,
    origin: (string-ascii 128),
    destination: (string-ascii 128),
    contents-hash: (buff 32),
    quantity: uint,
    status: (string-ascii 32),
    shipped-at: uint,
    delivered-at: (optional uint),
    tracked-by: principal
  }
)

(define-map checkpoints
  {checkpoint-id: uint}
  {
    shipment-id: uint,
    location: (string-ascii 128),
    timestamp: uint,
    verifier: principal,
    status-update: (string-ascii 64)
  }
)

(define-data-var shipment-nonce uint u0)
(define-data-var checkpoint-nonce uint u0)

(define-read-only (get-shipment (shipment-id uint))
  (map-get? aid-shipments {shipment-id: shipment-id})
)

(define-read-only (get-checkpoint (checkpoint-id uint))
  (map-get? checkpoints {checkpoint-id: checkpoint-id})
)

(define-public (create-shipment
  (program-id uint)
  (origin (string-ascii 128))
  (destination (string-ascii 128))
  (contents-hash (buff 32))
  (quantity uint)
)
  (let ((shipment-id (var-get shipment-nonce)))
    (asserts! (> quantity u0) err-invalid-params)
    (map-set aid-shipments {shipment-id: shipment-id}
      {
        program-id: program-id,
        origin: origin,
        destination: destination,
        contents-hash: contents-hash,
        quantity: quantity,
        status: "in-transit",
        shipped-at: stacks-block-height,
        delivered-at: none,
        tracked-by: tx-sender
      }
    )
    (var-set shipment-nonce (+ shipment-id u1))
    (ok shipment-id)
  )
)

(define-public (add-checkpoint
  (shipment-id uint)
  (location (string-ascii 128))
  (status-update (string-ascii 64))
)
  (let (
    (shipment (unwrap! (map-get? aid-shipments {shipment-id: shipment-id}) err-not-found))
    (checkpoint-id (var-get checkpoint-nonce))
  )
    (map-set checkpoints {checkpoint-id: checkpoint-id}
      {
        shipment-id: shipment-id,
        location: location,
        timestamp: stacks-block-height,
        verifier: tx-sender,
        status-update: status-update
      }
    )
    (var-set checkpoint-nonce (+ checkpoint-id u1))
    (ok checkpoint-id)
  )
)

(define-public (mark-delivered (shipment-id uint))
  (let ((shipment (unwrap! (map-get? aid-shipments {shipment-id: shipment-id}) err-not-found)))
    (asserts! (is-eq tx-sender (get tracked-by shipment)) err-unauthorized)
    (ok (map-set aid-shipments {shipment-id: shipment-id}
      (merge shipment {
        status: "delivered",
        delivered-at: (some stacks-block-height)
      })
    ))
  )
)
