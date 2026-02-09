(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map usage-metrics {tenant: principal, metric: (string-ascii 32)} {value: uint, timestamp: uint})

(define-public (record-usage (metric (string-ascii 32)) (value uint))
  (ok (map-set usage-metrics {tenant: tx-sender, metric: metric} {value: value, timestamp: stacks-block-height})))

(define-read-only (get-usage (tenant principal) (metric (string-ascii 32)))
  (ok (map-get? usage-metrics {tenant: tenant, metric: metric})))
