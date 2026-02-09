(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map performance-baselines (string-ascii 64) {metric-name: (string-ascii 64), baseline-value: uint, tolerance: uint})

(define-public (set-performance-baseline (key (string-ascii 64)) (metric-name (string-ascii 64)) (baseline-value uint) (tolerance uint))
  (ok (map-set performance-baselines key {metric-name: metric-name, baseline-value: baseline-value, tolerance: tolerance})))

(define-read-only (get-performance-baseline (key (string-ascii 64)))
  (ok (map-get? performance-baselines key)))
