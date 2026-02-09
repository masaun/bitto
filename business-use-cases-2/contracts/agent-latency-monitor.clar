(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map latency-measurements {agent: principal, operation: (string-ascii 64)} {latency-ms: uint, timestamp: uint})

(define-public (record-latency (operation (string-ascii 64)) (latency-ms uint))
  (ok (map-set latency-measurements {agent: tx-sender, operation: operation} {latency-ms: latency-ms, timestamp: stacks-block-height})))

(define-read-only (get-latency (agent principal) (operation (string-ascii 64)))
  (ok (map-get? latency-measurements {agent: agent, operation: operation})))
