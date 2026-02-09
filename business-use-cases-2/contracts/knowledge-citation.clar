(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map citations uint {source-kb-id: uint, citation-text: (string-ascii 256), timestamp: uint})
(define-data-var citation-nonce uint u0)

(define-public (add-citation (source-kb-id uint) (citation-text (string-ascii 256)))
  (let ((citation-id (+ (var-get citation-nonce) u1)))
    (map-set citations citation-id {source-kb-id: source-kb-id, citation-text: citation-text, timestamp: stacks-block-height})
    (var-set citation-nonce citation-id)
    (ok citation-id)))

(define-read-only (get-citation (citation-id uint))
  (ok (map-get? citations citation-id)))
