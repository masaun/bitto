(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map crisis-commands
  { command-id: uint }
  {
    command-type: (string-ascii 50),
    priority: uint,
    issued-by: principal,
    executed: bool,
    issued-at: uint
  }
)

(define-data-var command-nonce uint u0)

(define-public (issue-crisis-command (command-type (string-ascii 50)) (priority uint))
  (let ((command-id (+ (var-get command-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set crisis-commands { command-id: command-id }
      {
        command-type: command-type,
        priority: priority,
        issued-by: tx-sender,
        executed: false,
        issued-at: stacks-block-height
      }
    )
    (var-set command-nonce command-id)
    (ok command-id)
  )
)

(define-public (execute-command (command-id uint))
  (let ((command (unwrap! (map-get? crisis-commands { command-id: command-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set crisis-commands { command-id: command-id } (merge command { executed: true }))
    (ok true)
  )
)

(define-read-only (get-crisis-command (command-id uint))
  (ok (map-get? crisis-commands { command-id: command-id }))
)

(define-read-only (get-command-count)
  (ok (var-get command-nonce))
)
