(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map prompt-audit uint {prompt-id: uint, action: (string-ascii 64), actor: principal, timestamp: uint})
(define-data-var audit-nonce uint u0)

(define-public (log-action (prompt-id uint) (action (string-ascii 64)))
  (let ((audit-id (+ (var-get audit-nonce) u1)))
    (map-set prompt-audit audit-id {prompt-id: prompt-id, action: action, actor: tx-sender, timestamp: stacks-block-height})
    (var-set audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-audit-log (audit-id uint))
  (ok (map-get? prompt-audit audit-id)))
