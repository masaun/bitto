(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map lineage-records uint {data-id: uint, source: (string-ascii 128), transform: (string-ascii 128), timestamp: uint})
(define-data-var lineage-nonce uint u0)

(define-public (record-lineage (data-id uint) (source (string-ascii 128)) (transform (string-ascii 128)))
  (let ((lineage-id (+ (var-get lineage-nonce) u1)))
    (map-set lineage-records lineage-id {data-id: data-id, source: source, transform: transform, timestamp: stacks-block-height})
    (var-set lineage-nonce lineage-id)
    (ok lineage-id)))

(define-read-only (get-lineage (lineage-id uint))
  (ok (map-get? lineage-records lineage-id)))
