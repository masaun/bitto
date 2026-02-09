(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map prompt-expiry uint {prompt-id: uint, expiry-block: uint, auto-delete: bool})

(define-public (set-expiry (prompt-id uint) (expiry-block uint) (auto-delete bool))
  (begin
    (asserts! (> expiry-block stacks-block-height) ERR-INVALID-PARAMETER)
    (ok (map-set prompt-expiry prompt-id {prompt-id: prompt-id, expiry-block: expiry-block, auto-delete: auto-delete}))))

(define-read-only (get-expiry (prompt-id uint))
  (ok (map-get? prompt-expiry prompt-id)))
