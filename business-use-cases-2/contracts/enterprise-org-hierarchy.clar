(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map org-nodes uint {name: (string-ascii 64), parent-id: uint, level: uint})
(define-data-var node-nonce uint u0)

(define-public (create-org-node (name (string-ascii 64)) (parent-id uint) (level uint))
  (let ((node-id (+ (var-get node-nonce) u1)))
    (map-set org-nodes node-id {name: name, parent-id: parent-id, level: level})
    (var-set node-nonce node-id)
    (ok node-id)))

(define-read-only (get-org-node (node-id uint))
  (ok (map-get? org-nodes node-id)))
