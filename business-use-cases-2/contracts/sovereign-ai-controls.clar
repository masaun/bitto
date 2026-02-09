(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map sovereign-controls (string-ascii 32) {requires-approval: bool, prohibited-use-cases: (string-ascii 256)})

(define-public (set-sovereign-control (country (string-ascii 32)) (requires-approval bool) (prohibited-use-cases (string-ascii 256)))
  (ok (map-set sovereign-controls country {requires-approval: requires-approval, prohibited-use-cases: prohibited-use-cases})))

(define-read-only (get-sovereign-control (country (string-ascii 32)))
  (ok (map-get? sovereign-controls country)))
