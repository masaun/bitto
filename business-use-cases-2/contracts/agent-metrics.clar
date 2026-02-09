(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map metrics {agent: principal, metric-name: (string-ascii 64)} {value: uint, timestamp: uint})

(define-public (record-metric (metric-name (string-ascii 64)) (value uint))
  (ok (map-set metrics {agent: tx-sender, metric-name: metric-name} {value: value, timestamp: stacks-block-height})))

(define-read-only (get-metric (agent principal) (metric-name (string-ascii 64)))
  (ok (map-get? metrics {agent: agent, metric-name: metric-name})))
