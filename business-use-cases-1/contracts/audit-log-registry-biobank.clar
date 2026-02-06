(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map audit-logs
  { log-id: uint }
  {
    operation-type: (string-ascii 50),
    entity-type: (string-ascii 50),
    entity-id: uint,
    actor: principal,
    action-hash: (buff 32),
    timestamp: uint,
    metadata: (string-ascii 200)
  }
)

(define-data-var log-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-audit-log (log-id uint))
  (ok (map-get? audit-logs { log-id: log-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (log-operation (operation-type (string-ascii 50)) (entity-type (string-ascii 50)) (entity-id uint) (action-hash (buff 32)) (metadata (string-ascii 200)))
  (let
    (
      (log-id (var-get log-nonce))
    )
    (asserts! (is-none (map-get? audit-logs { log-id: log-id })) ERR_ALREADY_EXISTS)
    (map-set audit-logs
      { log-id: log-id }
      {
        operation-type: operation-type,
        entity-type: entity-type,
        entity-id: entity-id,
        actor: tx-sender,
        action-hash: action-hash,
        timestamp: stacks-block-height,
        metadata: metadata
      }
    )
    (var-set log-nonce (+ log-id u1))
    (ok log-id)
  )
)
