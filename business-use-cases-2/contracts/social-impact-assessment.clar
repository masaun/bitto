(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map social-impact-assessments uint {project-id: uint, impact-score: uint, beneficiaries: uint})
(define-data-var impact-nonce uint u0)

(define-public (assess-social-impact (project-id uint) (impact-score uint) (beneficiaries uint))
  (let ((assessment-id (+ (var-get impact-nonce) u1)))
    (asserts! (<= impact-score u100) ERR-INVALID-PARAMETER)
    (map-set social-impact-assessments assessment-id {project-id: project-id, impact-score: impact-score, beneficiaries: beneficiaries})
    (var-set impact-nonce assessment-id)
    (ok assessment-id)))

(define-read-only (get-social-impact (assessment-id uint))
  (ok (map-get? social-impact-assessments assessment-id)))
