(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map inference-outputs uint {output-hash: (buff 32), model-id: uint, owner: principal, timestamp: uint})
(define-data-var output-nonce uint u0)

(define-public (register-output (output-hash (buff 32)) (model-id uint))
  (let ((output-id (+ (var-get output-nonce) u1)))
    (map-set inference-outputs output-id {output-hash: output-hash, model-id: model-id, owner: tx-sender, timestamp: stacks-block-height})
    (var-set output-nonce output-id)
    (ok output-id)))

(define-read-only (get-inference-output (output-id uint))
  (ok (map-get? inference-outputs output-id)))
