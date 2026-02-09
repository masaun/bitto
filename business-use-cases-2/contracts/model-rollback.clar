(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map rollbacks uint {model-id: uint, from-version: uint, to-version: uint, reason: (string-ascii 128)})
(define-data-var rollback-nonce uint u0)

(define-public (execute-rollback (model-id uint) (from-version uint) (to-version uint) (reason (string-ascii 128)))
  (let ((rollback-id (+ (var-get rollback-nonce) u1)))
    (asserts! (< to-version from-version) ERR-INVALID-PARAMETER)
    (map-set rollbacks rollback-id {model-id: model-id, from-version: from-version, to-version: to-version, reason: reason})
    (var-set rollback-nonce rollback-id)
    (ok rollback-id)))

(define-read-only (get-rollback (rollback-id uint))
  (ok (map-get? rollbacks rollback-id)))
