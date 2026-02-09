(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map memory-stores uint {agent: principal, name: (string-ascii 64), capacity: uint, used: uint})
(define-data-var store-nonce uint u0)

(define-public (create-store (name (string-ascii 64)) (capacity uint))
  (let ((store-id (+ (var-get store-nonce) u1)))
    (asserts! (> capacity u0) ERR-INVALID-PARAMETER)
    (map-set memory-stores store-id {agent: tx-sender, name: name, capacity: capacity, used: u0})
    (var-set store-nonce store-id)
    (ok store-id)))

(define-public (update-usage (store-id uint) (amount uint))
  (let ((store (unwrap! (map-get? memory-stores store-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get agent store) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set memory-stores store-id (merge store {used: amount})))))

(define-read-only (get-store (store-id uint))
  (ok (map-get? memory-stores store-id)))
