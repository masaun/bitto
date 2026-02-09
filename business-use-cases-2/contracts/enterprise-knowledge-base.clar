(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map knowledge-items uint {title: (string-ascii 128), owner: principal, content-hash: (buff 32), indexed: bool})
(define-data-var kb-nonce uint u0)

(define-public (add-knowledge (title (string-ascii 128)) (content-hash (buff 32)))
  (let ((kb-id (+ (var-get kb-nonce) u1)))
    (map-set knowledge-items kb-id {title: title, owner: tx-sender, content-hash: content-hash, indexed: false})
    (var-set kb-nonce kb-id)
    (ok kb-id)))

(define-read-only (get-knowledge-item (kb-id uint))
  (ok (map-get? knowledge-items kb-id)))
