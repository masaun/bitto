(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map compliance-exceptions uint {requester: principal, reason: (string-ascii 256), approved: bool, expiry: uint})
(define-data-var exception-nonce uint u0)

(define-public (request-exception (reason (string-ascii 256)) (expiry uint))
  (let ((exception-id (+ (var-get exception-nonce) u1)))
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (map-set compliance-exceptions exception-id {requester: tx-sender, reason: reason, approved: false, expiry: expiry})
    (var-set exception-nonce exception-id)
    (ok exception-id)))

(define-read-only (get-exception (exception-id uint))
  (ok (map-get? compliance-exceptions exception-id)))
