(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map failover-configs uint {primary: (string-ascii 128), secondary: (string-ascii 128), auto-failover: bool})
(define-data-var failover-nonce uint u0)

(define-public (configure-failover (primary (string-ascii 128)) (secondary (string-ascii 128)) (auto-failover bool))
  (let ((config-id (+ (var-get failover-nonce) u1)))
    (map-set failover-configs config-id {primary: primary, secondary: secondary, auto-failover: auto-failover})
    (var-set failover-nonce config-id)
    (ok config-id)))

(define-read-only (get-failover-config (config-id uint))
  (ok (map-get? failover-configs config-id)))
