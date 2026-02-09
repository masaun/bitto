(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map feedback-items uint {agent: principal, feedback: (string-ascii 256), rating: uint, timestamp: uint})
(define-data-var feedback-nonce uint u0)

(define-public (submit-feedback (agent principal) (feedback (string-ascii 256)) (rating uint))
  (let ((feedback-id (+ (var-get feedback-nonce) u1)))
    (asserts! (<= rating u5) ERR-INVALID-PARAMETER)
    (map-set feedback-items feedback-id {agent: agent, feedback: feedback, rating: rating, timestamp: stacks-block-height})
    (var-set feedback-nonce feedback-id)
    (ok feedback-id)))

(define-read-only (get-feedback (feedback-id uint))
  (ok (map-get? feedback-items feedback-id)))
