(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map documents uint {doc-hash: (buff 32), uploader: principal, size: uint, timestamp: uint})
(define-data-var doc-nonce uint u0)

(define-public (ingest-document (doc-hash (buff 32)) (size uint))
  (let ((doc-id (+ (var-get doc-nonce) u1)))
    (asserts! (> size u0) ERR-INVALID-PARAMETER)
    (map-set documents doc-id {doc-hash: doc-hash, uploader: tx-sender, size: size, timestamp: stacks-block-height})
    (var-set doc-nonce doc-id)
    (ok doc-id)))

(define-read-only (get-document (doc-id uint))
  (ok (map-get? documents doc-id)))
