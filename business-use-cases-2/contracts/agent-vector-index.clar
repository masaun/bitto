(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map vector-indices uint {agent: principal, vector-hash: (buff 32), dimension: uint, indexed: bool})
(define-data-var index-nonce uint u0)

(define-public (create-index (vector-hash (buff 32)) (dimension uint))
  (let ((index-id (+ (var-get index-nonce) u1)))
    (asserts! (> dimension u0) ERR-INVALID-PARAMETER)
    (map-set vector-indices index-id {agent: tx-sender, vector-hash: vector-hash, dimension: dimension, indexed: false})
    (var-set index-nonce index-id)
    (ok index-id)))

(define-public (mark-indexed (index-id uint))
  (let ((index (unwrap! (map-get? vector-indices index-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get agent index) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set vector-indices index-id (merge index {indexed: true})))))

(define-read-only (get-index (index-id uint))
  (ok (map-get? vector-indices index-id)))
