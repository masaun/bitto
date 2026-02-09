(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ip-protections uint {agent-id: uint, protection-type: (string-ascii 32), hash: (buff 32)})
(define-data-var protection-nonce uint u0)

(define-public (protect-ip (agent-id uint) (protection-type (string-ascii 32)) (hash (buff 32)))
  (let ((protection-id (+ (var-get protection-nonce) u1)))
    (map-set ip-protections protection-id {agent-id: agent-id, protection-type: protection-type, hash: hash})
    (var-set protection-nonce protection-id)
    (ok protection-id)))

(define-read-only (get-protection (protection-id uint))
  (ok (map-get? ip-protections protection-id)))
