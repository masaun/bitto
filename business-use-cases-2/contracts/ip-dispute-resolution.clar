(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map ip-disputes uint {claim-id: uint, arbitrator: principal, decision: (string-ascii 128), resolved: bool})
(define-data-var dispute-nonce uint u0)

(define-public (create-dispute (claim-id uint) (arbitrator principal))
  (let ((dispute-id (+ (var-get dispute-nonce) u1)))
    (map-set ip-disputes dispute-id {claim-id: claim-id, arbitrator: arbitrator, decision: "", resolved: false})
    (var-set dispute-nonce dispute-id)
    (ok dispute-id)))

(define-read-only (get-dispute (dispute-id uint))
  (ok (map-get? ip-disputes dispute-id)))
