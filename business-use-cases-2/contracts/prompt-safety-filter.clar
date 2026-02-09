(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map safety-filters uint {name: (string-ascii 64), enabled: bool, threshold: uint})
(define-data-var filter-nonce uint u0)

(define-public (create-filter (name (string-ascii 64)) (threshold uint))
  (let ((filter-id (+ (var-get filter-nonce) u1)))
    (asserts! (<= threshold u100) ERR-INVALID-PARAMETER)
    (map-set safety-filters filter-id {name: name, enabled: true, threshold: threshold})
    (var-set filter-nonce filter-id)
    (ok filter-id)))

(define-read-only (get-filter (filter-id uint))
  (ok (map-get? safety-filters filter-id)))
