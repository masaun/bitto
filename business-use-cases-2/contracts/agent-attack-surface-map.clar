(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map attack-surfaces uint {agent: principal, surface: (string-ascii 128), risk-level: uint, mitigated: bool})
(define-data-var surface-nonce uint u0)

(define-public (map-surface (surface (string-ascii 128)) (risk-level uint))
  (let ((surface-id (+ (var-get surface-nonce) u1)))
    (asserts! (<= risk-level u10) ERR-INVALID-PARAMETER)
    (map-set attack-surfaces surface-id {agent: tx-sender, surface: surface, risk-level: risk-level, mitigated: false})
    (var-set surface-nonce surface-id)
    (ok surface-id)))

(define-public (mark-mitigated (surface-id uint))
  (let ((surface (unwrap! (map-get? attack-surfaces surface-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get agent surface) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set attack-surfaces surface-id (merge surface {mitigated: true})))))

(define-read-only (get-surface (surface-id uint))
  (ok (map-get? attack-surfaces surface-id)))
