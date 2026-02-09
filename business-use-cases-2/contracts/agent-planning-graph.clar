(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map plans uint {owner: principal, goal: (string-ascii 256), steps: uint, status: (string-ascii 20)})
(define-map plan-edges {from: uint, to: uint} {weight: uint, condition: (string-ascii 128)})
(define-data-var plan-nonce uint u0)

(define-public (create-plan (goal (string-ascii 256)) (steps uint))
  (let ((plan-id (+ (var-get plan-nonce) u1)))
    (asserts! (> steps u0) ERR-INVALID-PARAMETER)
    (map-set plans plan-id {owner: tx-sender, goal: goal, steps: steps, status: "active"})
    (var-set plan-nonce plan-id)
    (ok plan-id)))

(define-public (add-edge (from uint) (to uint) (weight uint) (condition (string-ascii 128)))
  (let ((plan (unwrap! (map-get? plans from) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner plan) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set plan-edges {from: from, to: to} {weight: weight, condition: condition}))))

(define-public (update-status (plan-id uint) (new-status (string-ascii 20)))
  (let ((plan (unwrap! (map-get? plans plan-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner plan) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set plans plan-id (merge plan {status: new-status})))))

(define-read-only (get-plan (plan-id uint))
  (ok (map-get? plans plan-id)))

(define-read-only (get-edge (from uint) (to uint))
  (ok (map-get? plan-edges {from: from, to: to})))
