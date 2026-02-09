(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map models uint {owner: principal, name: (string-ascii 64), version: uint, hash: (buff 32)})
(define-data-var model-nonce uint u0)

(define-public (register-model (name (string-ascii 64)) (version uint) (hash (buff 32)))
  (let ((model-id (+ (var-get model-nonce) u1)))
    (asserts! (> version u0) ERR-INVALID-PARAMETER)
    (map-set models model-id {owner: tx-sender, name: name, version: version, hash: hash})
    (var-set model-nonce model-id)
    (ok model-id)))

(define-read-only (get-model (model-id uint))
  (ok (map-get? models model-id)))
