(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-program-not-found (err u102))
(define-constant err-invalid-outcome (err u103))
(define-constant err-already-verified (err u104))

(define-map programs uint {
  name: (string-ascii 100),
  budget: uint,
  spent: uint,
  target-outcome: uint,
  actual-outcome: uint,
  active: bool
})

(define-map verifiers principal bool)
(define-data-var program-nonce uint u0)

(define-read-only (get-program (program-id uint))
  (ok (map-get? programs program-id)))

(define-read-only (is-verifier (account principal))
  (default-to false (map-get? verifiers account)))

(define-public (create-program (name (string-ascii 100)) (budget uint) (target-outcome uint))
  (let ((program-id (+ (var-get program-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set programs program-id {
      name: name,
      budget: budget,
      spent: u0,
      target-outcome: target-outcome,
      actual-outcome: u0,
      active: true
    })
    (var-set program-nonce program-id)
    (ok program-id)))

(define-public (record-spending (program-id uint) (amount uint))
  (let ((program (unwrap! (map-get? programs program-id) err-program-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= (+ (get spent program) amount) (get budget program)) err-invalid-outcome)
    (ok (map-set programs program-id (merge program {spent: (+ (get spent program) amount)})))))

(define-public (verify-outcome (program-id uint) (outcome uint))
  (let ((program (unwrap! (map-get? programs program-id) err-program-not-found)))
    (asserts! (is-verifier tx-sender) err-not-authorized)
    (asserts! (get active program) err-already-verified)
    (ok (map-set programs program-id (merge program {actual-outcome: outcome, active: false})))))

(define-public (add-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set verifiers verifier true))))

(define-public (remove-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete verifiers verifier))))
