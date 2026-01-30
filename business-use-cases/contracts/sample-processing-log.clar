(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map processing-logs
  { log-id: uint }
  {
    sample-id: uint,
    process-type: (string-ascii 50),
    processor: principal,
    method: (string-ascii 100),
    equipment-id: (string-ascii 50),
    result-hash: (buff 32),
    timestamp: uint,
    success: bool
  }
)

(define-data-var log-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-processing-log (log-id uint))
  (ok (map-get? processing-logs { log-id: log-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (log-processing (sample-id uint) (process-type (string-ascii 50)) (method (string-ascii 100)) (equipment-id (string-ascii 50)) (result-hash (buff 32)) (success bool))
  (let
    (
      (log-id (var-get log-nonce))
    )
    (asserts! (is-none (map-get? processing-logs { log-id: log-id })) ERR_ALREADY_EXISTS)
    (map-set processing-logs
      { log-id: log-id }
      {
        sample-id: sample-id,
        process-type: process-type,
        processor: tx-sender,
        method: method,
        equipment-id: equipment-id,
        result-hash: result-hash,
        timestamp: stacks-block-height,
        success: success
      }
    )
    (var-set log-nonce (+ log-id u1))
    (ok log-id)
  )
)
