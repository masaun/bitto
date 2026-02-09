(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map escrows uint {amount: uint, beneficiary: principal, released: bool, expires: uint})
(define-data-var escrow-nonce uint u0)

(define-public (create-escrow (amount uint) (beneficiary principal) (expires uint))
  (let ((escrow-id (+ (var-get escrow-nonce) u1)))
    (asserts! (and (> amount u0) (> expires stacks-block-height)) ERR-INVALID-PARAMETER)
    (map-set escrows escrow-id {amount: amount, beneficiary: beneficiary, released: false, expires: expires})
    (var-set escrow-nonce escrow-id)
    (ok escrow-id)))

(define-public (release-escrow (escrow-id uint))
  (let ((escrow (unwrap! (map-get? escrows escrow-id) ERR-NOT-FOUND)))
    (ok (map-set escrows escrow-id (merge escrow {released: true})))))

(define-read-only (get-escrow (escrow-id uint))
  (ok (map-get? escrows escrow-id)))
