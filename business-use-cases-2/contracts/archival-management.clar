(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map archival-records principal {archived-at: uint, archive-hash: (buff 32), retention-period: uint})

(define-public (archive-agent (agent principal) (archive-hash (buff 32)) (retention-period uint))
  (ok (map-set archival-records agent {archived-at: stacks-block-height, archive-hash: archive-hash, retention-period: retention-period})))

(define-read-only (get-archival-record (agent principal))
  (ok (map-get? archival-records agent)))
