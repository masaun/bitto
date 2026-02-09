(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map intrusion-responses uint {agent: principal, threat-type: (string-ascii 64), action: (string-ascii 64), timestamp: uint})
(define-data-var response-nonce uint u0)

(define-public (execute-response (threat-type (string-ascii 64)) (action (string-ascii 64)))
  (let ((response-id (+ (var-get response-nonce) u1)))
    (map-set intrusion-responses response-id {agent: tx-sender, threat-type: threat-type, action: action, timestamp: stacks-block-height})
    (var-set response-nonce response-id)
    (ok response-id)))

(define-read-only (get-response (response-id uint))
  (ok (map-get? intrusion-responses response-id)))
