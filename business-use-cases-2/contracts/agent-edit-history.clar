(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map edit-history uint {item-id: uint, editor: principal, change-hash: (buff 32), timestamp: uint})
(define-data-var edit-nonce uint u0)

(define-public (record-edit (item-id uint) (change-hash (buff 32)))
  (let ((edit-id (+ (var-get edit-nonce) u1)))
    (map-set edit-history edit-id {item-id: item-id, editor: tx-sender, change-hash: change-hash, timestamp: stacks-block-height})
    (var-set edit-nonce edit-id)
    (ok edit-id)))

(define-read-only (get-edit (edit-id uint))
  (ok (map-get? edit-history edit-id)))
