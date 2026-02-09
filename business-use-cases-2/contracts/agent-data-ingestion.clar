(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map data-batches uint {agent: principal, batch-hash: (buff 32), record-count: uint, validated: bool})
(define-data-var batch-nonce uint u0)

(define-public (ingest-batch (batch-hash (buff 32)) (record-count uint))
  (let ((batch-id (+ (var-get batch-nonce) u1)))
    (asserts! (> record-count u0) ERR-INVALID-PARAMETER)
    (map-set data-batches batch-id {agent: tx-sender, batch-hash: batch-hash, record-count: record-count, validated: false})
    (var-set batch-nonce batch-id)
    (ok batch-id)))

(define-public (validate-batch (batch-id uint))
  (let ((batch (unwrap! (map-get? data-batches batch-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get agent batch) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set data-batches batch-id (merge batch {validated: true})))))

(define-read-only (get-batch (batch-id uint))
  (ok (map-get? data-batches batch-id)))
