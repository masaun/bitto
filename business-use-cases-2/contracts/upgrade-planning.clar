(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map upgrade-plans principal {current-version: (string-ascii 32), target-version: (string-ascii 32), scheduled-at: uint})

(define-public (plan-upgrade (agent principal) (current-version (string-ascii 32)) (target-version (string-ascii 32)) (scheduled-at uint))
  (begin
    (asserts! (> scheduled-at stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set upgrade-plans agent {current-version: current-version, target-version: target-version, scheduled-at: scheduled-at}))))

(define-read-only (get-upgrade-plan (agent principal))
  (ok (map-get? upgrade-plans agent)))
