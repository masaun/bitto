(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ethical-guidelines uint {guideline: (string-ascii 256), category: (string-ascii 64), active: bool})
(define-data-var guideline-nonce uint u0)

(define-public (create-ethical-guideline (guideline (string-ascii 256)) (category (string-ascii 64)))
  (let ((guideline-id (+ (var-get guideline-nonce) u1)))
    (map-set ethical-guidelines guideline-id {guideline: guideline, category: category, active: true})
    (var-set guideline-nonce guideline-id)
    (ok guideline-id)))

(define-read-only (get-ethical-guideline (guideline-id uint))
  (ok (map-get? ethical-guidelines guideline-id)))
