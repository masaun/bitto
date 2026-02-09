(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map agent-metadata uint {category: (string-ascii 32), tags: (string-ascii 128), indexed: bool})

(define-public (index-agent (agent-id uint) (category (string-ascii 32)) (tags (string-ascii 128)))
  (ok (map-set agent-metadata agent-id {category: category, tags: tags, indexed: true})))

(define-read-only (get-metadata (agent-id uint))
  (ok (map-get? agent-metadata agent-id)))
