(define-constant contract-owner tx-sender)

(define-map sessions uint {patient: principal, provider: principal, session-type: (string-ascii 32), timestamp: uint})
(define-data-var session-nonce uint u0)

(define-public (create-session (provider principal) (session-type (string-ascii 32)))
  (let ((id (var-get session-nonce)))
    (map-set sessions id {patient: tx-sender, provider: provider, session-type: session-type, timestamp: stacks-block-height})
    (var-set session-nonce (+ id u1))
    (ok id)))

(define-read-only (get-session (session-id uint))
  (ok (map-get? sessions session-id)))
