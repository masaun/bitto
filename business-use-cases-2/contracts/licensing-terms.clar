(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map licensing-terms uint {ip-id: uint, license-type: (string-ascii 64), terms-hash: (buff 32)})

(define-public (set-licensing-terms (ip-id uint) (license-type (string-ascii 64)) (terms-hash (buff 32)))
  (ok (map-set licensing-terms ip-id {ip-id: ip-id, license-type: license-type, terms-hash: terms-hash})))

(define-read-only (get-licensing-terms (ip-id uint))
  (ok (map-get? licensing-terms ip-id)))
