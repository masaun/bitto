(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map agent-lifecycle principal {stage: (string-ascii 32), created-at: uint, updated-at: uint})

(define-public (set-lifecycle-stage (agent principal) (stage (string-ascii 32)))
  (ok (map-set agent-lifecycle agent {stage: stage, created-at: stacks-block-height, updated-at: stacks-block-height})))

(define-read-only (get-lifecycle-stage (agent principal))
  (ok (map-get? agent-lifecycle agent)))
