(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map reflections uint {agent: principal, content: (string-ascii 512), learning: (string-ascii 256), timestamp: uint})
(define-data-var reflection-nonce uint u0)

(define-public (add-reflection (content (string-ascii 512)) (learning (string-ascii 256)))
  (let ((refl-id (+ (var-get reflection-nonce) u1)))
    (map-set reflections refl-id {agent: tx-sender, content: content, learning: learning, timestamp: stacks-block-height})
    (var-set reflection-nonce refl-id)
    (ok refl-id)))

(define-read-only (get-reflection (refl-id uint))
  (ok (map-get? reflections refl-id)))
