(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map storage-conditions
  { record-id: uint }
  {
    sample-id: uint,
    storage-location: (string-ascii 100),
    temperature: int,
    humidity: uint,
    duration: uint,
    monitor: principal,
    condition-hash: (buff 32),
    timestamp: uint,
    alert: bool
  }
)

(define-data-var record-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-storage-condition (record-id uint))
  (ok (map-get? storage-conditions { record-id: record-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (record-condition (sample-id uint) (storage-location (string-ascii 100)) (temperature int) (humidity uint) (duration uint) (condition-hash (buff 32)) (alert bool))
  (let
    (
      (record-id (var-get record-nonce))
    )
    (asserts! (is-none (map-get? storage-conditions { record-id: record-id })) ERR_ALREADY_EXISTS)
    (map-set storage-conditions
      { record-id: record-id }
      {
        sample-id: sample-id,
        storage-location: storage-location,
        temperature: temperature,
        humidity: humidity,
        duration: duration,
        monitor: tx-sender,
        condition-hash: condition-hash,
        timestamp: stacks-block-height,
        alert: alert
      }
    )
    (var-set record-nonce (+ record-id u1))
    (ok record-id)
  )
)
