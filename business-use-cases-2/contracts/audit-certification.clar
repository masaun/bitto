(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map audit-certifications uint {certification: (string-ascii 64), issued-by: principal, valid-until: uint})
(define-data-var cert-nonce uint u0)

(define-public (issue-audit-certification (certification (string-ascii 64)) (valid-until uint))
  (let ((cert-id (+ (var-get cert-nonce) u1)))
    (asserts! (> valid-until stacks-block-height) ERR-INVALID-PARAMETER)
    (map-set audit-certifications cert-id {certification: certification, issued-by: tx-sender, valid-until: valid-until})
    (var-set cert-nonce cert-id)
    (ok cert-id)))

(define-read-only (get-audit-certification (cert-id uint))
  (ok (map-get? audit-certifications cert-id)))
