(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map memory-expiry {agent: principal, memory-id: uint} {expiry-block: uint, expired: bool})

(define-public (set-expiry (memory-id uint) (expiry-block uint))
  (begin
    (asserts! (> expiry-block stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set memory-expiry {agent: tx-sender, memory-id: memory-id} {expiry-block: expiry-block, expired: false}))))

(define-public (mark-expired (memory-id uint))
  (let ((expiry (unwrap! (map-get? memory-expiry {agent: tx-sender, memory-id: memory-id}) ERR-NOT-FOUND)))
    (ok (map-set memory-expiry {agent: tx-sender, memory-id: memory-id} (merge expiry {expired: true})))))

(define-read-only (get-expiry (agent principal) (memory-id uint))
  (ok (map-get? memory-expiry {agent: agent, memory-id: memory-id})))
