(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map dao-execution-queue uint {proposal-id: uint, execution-time: uint, executed: bool})
(define-data-var execution-nonce uint u0)

(define-public (queue-execution (proposal-id uint) (execution-time uint))
  (let ((queue-id (+ (var-get execution-nonce) u1)))
    (asserts! (> execution-time stacks-block-height) ERR-INVALID-PARAMETER)
    (map-set dao-execution-queue queue-id {proposal-id: proposal-id, execution-time: execution-time, executed: false})
    (var-set execution-nonce queue-id)
    (ok queue-id)))

(define-read-only (get-execution-queue (queue-id uint))
  (ok (map-get? dao-execution-queue queue-id)))
