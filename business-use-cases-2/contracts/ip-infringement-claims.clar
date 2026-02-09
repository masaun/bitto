(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map infringement-claims uint {ip-id: uint, claimant: principal, description: (string-ascii 256), resolved: bool})
(define-data-var claim-nonce uint u0)

(define-public (file-infringement-claim (ip-id uint) (description (string-ascii 256)))
  (let ((claim-id (+ (var-get claim-nonce) u1)))
    (map-set infringement-claims claim-id {ip-id: ip-id, claimant: tx-sender, description: description, resolved: false})
    (var-set claim-nonce claim-id)
    (ok claim-id)))

(define-read-only (get-claim (claim-id uint))
  (ok (map-get? infringement-claims claim-id)))
