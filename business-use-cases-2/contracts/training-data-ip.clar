(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map training-data-ip uint {dataset-hash: (buff 32), owner: principal, license: (string-ascii 64)})
(define-data-var data-ip-nonce uint u0)

(define-public (register-training-data (dataset-hash (buff 32)) (license (string-ascii 64)))
  (let ((data-ip-id (+ (var-get data-ip-nonce) u1)))
    (map-set training-data-ip data-ip-id {dataset-hash: dataset-hash, owner: tx-sender, license: license})
    (var-set data-ip-nonce data-ip-id)
    (ok data-ip-id)))

(define-read-only (get-training-data-ip (data-ip-id uint))
  (ok (map-get? training-data-ip data-ip-id)))
