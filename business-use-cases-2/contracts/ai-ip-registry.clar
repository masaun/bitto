(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ip-records uint {asset-type: (string-ascii 64), owner: principal, hash: (buff 32), registered-at: uint})
(define-data-var ip-nonce uint u0)

(define-public (register-ip (asset-type (string-ascii 64)) (hash (buff 32)))
  (let ((ip-id (+ (var-get ip-nonce) u1)))
    (map-set ip-records ip-id {asset-type: asset-type, owner: tx-sender, hash: hash, registered-at: stacks-block-height})
    (var-set ip-nonce ip-id)
    (ok ip-id)))

(define-read-only (get-ip-record (ip-id uint))
  (ok (map-get? ip-records ip-id)))
