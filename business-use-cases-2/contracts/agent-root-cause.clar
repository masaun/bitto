(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map root-causes uint {error-id: uint, cause: (string-ascii 256), resolved: bool})
(define-data-var cause-nonce uint u0)

(define-public (identify-root-cause (error-id uint) (cause (string-ascii 256)))
  (let ((cause-id (+ (var-get cause-nonce) u1)))
    (map-set root-causes cause-id {error-id: error-id, cause: cause, resolved: false})
    (var-set cause-nonce cause-id)
    (ok cause-id)))

(define-read-only (get-root-cause (cause-id uint))
  (ok (map-get? root-causes cause-id)))
