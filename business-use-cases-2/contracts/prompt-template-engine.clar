(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map templates uint {name: (string-ascii 64), owner: principal, template-hash: (buff 32), variables: uint})
(define-data-var template-nonce uint u0)

(define-public (register-template (name (string-ascii 64)) (template-hash (buff 32)) (variables uint))
  (let ((template-id (+ (var-get template-nonce) u1)))
    (map-set templates template-id {name: name, owner: tx-sender, template-hash: template-hash, variables: variables})
    (var-set template-nonce template-id)
    (ok template-id)))

(define-read-only (get-template (template-id uint))
  (ok (map-get? templates template-id)))
