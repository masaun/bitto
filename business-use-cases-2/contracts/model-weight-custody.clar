(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map weight-custody uint {model-id: uint, custodian: principal, weight-hash: (buff 32), locked: bool})
(define-data-var custody-nonce uint u0)

(define-public (store-weights (model-id uint) (weight-hash (buff 32)))
  (let ((custody-id (+ (var-get custody-nonce) u1)))
    (map-set weight-custody custody-id {model-id: model-id, custodian: tx-sender, weight-hash: weight-hash, locked: false})
    (var-set custody-nonce custody-id)
    (ok custody-id)))

(define-public (lock-weights (custody-id uint))
  (let ((custody (unwrap! (map-get? weight-custody custody-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get custodian custody) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set weight-custody custody-id (merge custody {locked: true})))))

(define-read-only (get-custody (custody-id uint))
  (ok (map-get? weight-custody custody-id)))
