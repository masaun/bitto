(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map knowledge-transfers uint {from-agent: principal, to-agent: principal, knowledge-type: (string-ascii 64), completed: bool})
(define-data-var kt-nonce uint u0)

(define-public (transfer-knowledge (from-agent principal) (to-agent principal) (knowledge-type (string-ascii 64)))
  (let ((transfer-id (+ (var-get kt-nonce) u1)))
    (map-set knowledge-transfers transfer-id {from-agent: from-agent, to-agent: to-agent, knowledge-type: knowledge-type, completed: false})
    (var-set kt-nonce transfer-id)
    (ok transfer-id)))

(define-read-only (get-knowledge-transfer (transfer-id uint))
  (ok (map-get? knowledge-transfers transfer-id)))
