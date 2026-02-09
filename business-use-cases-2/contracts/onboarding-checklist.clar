(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map onboarding-checklists principal {item: (string-ascii 128), completed: bool, timestamp: uint})

(define-public (complete-onboarding-item (item (string-ascii 128)))
  (ok (map-set onboarding-checklists tx-sender {item: item, completed: true, timestamp: stacks-block-height})))

(define-read-only (get-onboarding-item (agent principal))
  (ok (map-get? onboarding-checklists agent)))
