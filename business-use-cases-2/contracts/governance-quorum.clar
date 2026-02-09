(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map quorum-settings uint {proposal-type: (string-ascii 64), min-participation: uint, min-approval: uint})

(define-public (set-quorum (proposal-type (string-ascii 64)) (min-participation uint) (min-approval uint))
  (begin
    (asserts! (and (<= min-participation u100) (<= min-approval u100)) ERR-INVALID-PARAMETER)
    (ok (map-set quorum-settings u1 {proposal-type: proposal-type, min-participation: min-participation, min-approval: min-approval}))))

(define-read-only (get-quorum (setting-id uint))
  (ok (map-get? quorum-settings setting-id)))
