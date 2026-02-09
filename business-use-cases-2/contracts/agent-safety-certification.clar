(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map safety-certifications uint {agent: principal, cert-type: (string-ascii 64), valid-until: uint, revoked: bool})
(define-data-var cert-nonce uint u0)

(define-public (issue-certification (cert-type (string-ascii 64)) (valid-until uint))
  (let ((cert-id (+ (var-get cert-nonce) u1)))
    (asserts! (> valid-until stacks-block-height) ERR-INVALID-PARAMETER)
    (map-set safety-certifications cert-id {agent: tx-sender, cert-type: cert-type, valid-until: valid-until, revoked: false})
    (var-set cert-nonce cert-id)
    (ok cert-id)))

(define-read-only (get-certification (cert-id uint))
  (ok (map-get? safety-certifications cert-id)))
