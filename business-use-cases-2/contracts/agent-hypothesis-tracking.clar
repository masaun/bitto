(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map hypotheses uint {agent: principal, description: (string-ascii 256), confidence: uint, validated: bool})
(define-data-var hypothesis-nonce uint u0)

(define-public (create-hypothesis (description (string-ascii 256)) (confidence uint))
  (let ((hyp-id (+ (var-get hypothesis-nonce) u1)))
    (asserts! (<= confidence u100) ERR-INVALID-PARAMETER)
    (map-set hypotheses hyp-id {agent: tx-sender, description: description, confidence: confidence, validated: false})
    (var-set hypothesis-nonce hyp-id)
    (ok hyp-id)))

(define-public (validate-hypothesis (hyp-id uint))
  (let ((hyp (unwrap! (map-get? hypotheses hyp-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get agent hyp) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set hypotheses hyp-id (merge hyp {validated: true})))))

(define-read-only (get-hypothesis (hyp-id uint))
  (ok (map-get? hypotheses hyp-id)))
