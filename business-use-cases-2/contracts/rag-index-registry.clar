(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map rag-indices uint {name: (string-ascii 64), owner: principal, embeddings-count: uint, active: bool})
(define-data-var index-nonce uint u0)

(define-public (create-rag-index (name (string-ascii 64)) (embeddings-count uint))
  (let ((index-id (+ (var-get index-nonce) u1)))
    (map-set rag-indices index-id {name: name, owner: tx-sender, embeddings-count: embeddings-count, active: true})
    (var-set index-nonce index-id)
    (ok index-id)))

(define-read-only (get-rag-index (index-id uint))
  (ok (map-get? rag-indices index-id)))
