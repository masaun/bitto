(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map deletion-requests uint {requester: principal, data-id: uint, reason: (string-ascii 128), completed: bool})
(define-data-var deletion-nonce uint u0)

(define-public (request-deletion (data-id uint) (reason (string-ascii 128)))
  (let ((request-id (+ (var-get deletion-nonce) u1)))
    (map-set deletion-requests request-id {requester: tx-sender, data-id: data-id, reason: reason, completed: false})
    (var-set deletion-nonce request-id)
    (ok request-id)))

(define-public (complete-deletion (request-id uint))
  (let ((request (unwrap! (map-get? deletion-requests request-id) ERR-NOT-FOUND)))
    (ok (map-set deletion-requests request-id (merge request {completed: true})))))

(define-read-only (get-deletion-request (request-id uint))
  (ok (map-get? deletion-requests request-id)))
