(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map concepts uint {agent: principal, concept: (string-ascii 128), definition: (string-ascii 256), weight: uint})
(define-data-var concept-nonce uint u0)

(define-public (store-concept (concept (string-ascii 128)) (definition (string-ascii 256)) (weight uint))
  (let ((concept-id (+ (var-get concept-nonce) u1)))
    (asserts! (<= weight u100) ERR-INVALID-PARAMETER)
    (map-set concepts concept-id {agent: tx-sender, concept: concept, definition: definition, weight: weight})
    (var-set concept-nonce concept-id)
    (ok concept-id)))

(define-read-only (get-concept (concept-id uint))
  (ok (map-get? concepts concept-id)))
