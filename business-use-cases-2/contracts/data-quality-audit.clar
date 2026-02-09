(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map data-quality-audits uint {dataset-id: uint, completeness: uint, accuracy: uint, validity: uint})
(define-data-var dq-audit-nonce uint u0)

(define-public (audit-data-quality (dataset-id uint) (completeness uint) (accuracy uint) (validity uint))
  (let ((audit-id (+ (var-get dq-audit-nonce) u1)))
    (asserts! (and (<= completeness u100) (<= accuracy u100) (<= validity u100)) ERR-INVALID-PARAMETER)
    (map-set data-quality-audits audit-id {dataset-id: dataset-id, completeness: completeness, accuracy: accuracy, validity: validity})
    (var-set dq-audit-nonce audit-id)
    (ok audit-id)))

(define-read-only (get-data-quality-audit (audit-id uint))
  (ok (map-get? data-quality-audits audit-id)))
