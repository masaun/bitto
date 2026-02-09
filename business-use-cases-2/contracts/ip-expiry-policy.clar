(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ip-expiry uint {ip-id: uint, expiry-block: uint, auto-renew: bool, expired: bool})

(define-public (set-ip-expiry (ip-id uint) (expiry-block uint) (auto-renew bool))
  (begin
    (asserts! (> expiry-block stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set ip-expiry ip-id {ip-id: ip-id, expiry-block: expiry-block, auto-renew: auto-renew, expired: false}))))

(define-read-only (get-ip-expiry (ip-id uint))
  (ok (map-get? ip-expiry ip-id)))
