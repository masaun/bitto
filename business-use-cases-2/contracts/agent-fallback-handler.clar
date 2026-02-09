(define-map fallbacks {task-id: uint} {primary-agent: principal, fallback-agent: principal, triggered: bool})
(define-map fallback-history {task-id: uint, sequence: uint} {from: principal, to: principal, timestamp: uint})
(define-map fallback-count uint uint)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-FALLBACK-EXISTS (err u101))

(define-public (register-fallback (task-id uint) (fallback-agent principal))
  (begin
    (asserts! (is-none (map-get? fallbacks {task-id: task-id})) ERR-FALLBACK-EXISTS)
    (ok (map-set fallbacks {task-id: task-id} {primary-agent: tx-sender, fallback-agent: fallback-agent, triggered: false}))))

(define-public (trigger-fallback (task-id uint))
  (let ((fallback (unwrap! (map-get? fallbacks {task-id: task-id}) ERR-NOT-AUTHORIZED))
        (seq (default-to u0 (map-get? fallback-count task-id))))
    (map-set fallbacks {task-id: task-id} (merge fallback {triggered: true}))
    (map-set fallback-history {task-id: task-id, sequence: seq} {from: (get primary-agent fallback), to: (get fallback-agent fallback), timestamp: stacks-block-height})
    (map-set fallback-count task-id (+ seq u1))
    (ok true)))

(define-read-only (get-fallback (task-id uint))
  (map-get? fallbacks {task-id: task-id}))

(define-read-only (get-fallback-history (task-id uint) (sequence uint))
  (map-get? fallback-history {task-id: task-id, sequence: sequence}))
