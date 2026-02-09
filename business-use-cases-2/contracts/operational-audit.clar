(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map operational-audits uint {process: (string-ascii 64), efficiency: uint, issues-found: uint})
(define-data-var operational-audit-nonce uint u0)

(define-public (audit-operations (process (string-ascii 64)) (efficiency uint) (issues-found uint))
  (let ((audit-id (+ (var-get operational-audit-nonce) u1)))
    (asserts! (<= efficiency u100) ERR-INVALID-PARAMETER)
    (map-set operational-audits audit-id {process: process, efficiency: efficiency, issues-found: issues-found})
    (var-set operational-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-operational-audit (audit-id uint))
  (ok (map-get? operational-audits audit-id)))
