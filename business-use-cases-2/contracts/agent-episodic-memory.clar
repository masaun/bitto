(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map episodes uint {agent: principal, event: (string-ascii 256), context: (string-ascii 256), timestamp: uint})
(define-data-var episode-nonce uint u0)

(define-public (record-episode (event (string-ascii 256)) (context (string-ascii 256)))
  (let ((episode-id (+ (var-get episode-nonce) u1)))
    (map-set episodes episode-id {agent: tx-sender, event: event, context: context, timestamp: stacks-block-height})
    (var-set episode-nonce episode-id)
    (ok episode-id)))

(define-read-only (get-episode (episode-id uint))
  (ok (map-get? episodes episode-id)))
