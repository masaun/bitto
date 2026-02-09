(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map tenants uint {name: (string-ascii 64), admin: principal, active: bool})
(define-data-var tenant-nonce uint u0)

(define-public (create-tenant (name (string-ascii 64)))
  (let ((tenant-id (+ (var-get tenant-nonce) u1)))
    (map-set tenants tenant-id {name: name, admin: tx-sender, active: true})
    (var-set tenant-nonce tenant-id)
    (ok tenant-id)))

(define-public (deactivate-tenant (tenant-id uint))
  (let ((tenant (unwrap! (map-get? tenants tenant-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get admin tenant) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set tenants tenant-id (merge tenant {active: false})))))

(define-read-only (get-tenant (tenant-id uint))
  (ok (map-get? tenants tenant-id)))
