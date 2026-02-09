(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map deprecation-notices principal {deprecated-at: uint, end-of-life: uint, replacement: (string-ascii 64)})

(define-public (issue-deprecation-notice (agent principal) (end-of-life uint) (replacement (string-ascii 64)))
  (begin
    (asserts! (> end-of-life stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set deprecation-notices agent {deprecated-at: stacks-block-height, end-of-life: end-of-life, replacement: replacement}))))

(define-read-only (get-deprecation-notice (agent principal))
  (ok (map-get? deprecation-notices agent)))
