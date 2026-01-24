(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-code-not-found (err u102))

(define-map form-codes uint {
  district-name: (string-ascii 100),
  building-form: (string-ascii 200),
  street-standards: (string-ascii 200),
  public-space-requirements: (string-ascii 200),
  architectural-standards: (string-ascii 200),
  active: bool
})

(define-map development-applications {code-id: uint, applicant: principal} {
  project-description: (string-ascii 500),
  compliance-checklist: (string-ascii 500),
  status: (string-ascii 20),
  submitted-at: uint
})

(define-data-var code-nonce uint u0)

(define-read-only (get-code (code-id uint))
  (ok (map-get? form-codes code-id)))

(define-read-only (get-application (code-id uint) (applicant principal))
  (ok (map-get? development-applications {code-id: code-id, applicant: applicant})))

(define-public (create-form-code (district-name (string-ascii 100)) (building-form (string-ascii 200)) (street-standards (string-ascii 200)) (public-space-requirements (string-ascii 200)) (architectural-standards (string-ascii 200)))
  (let ((code-id (+ (var-get code-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set form-codes code-id {
      district-name: district-name,
      building-form: building-form,
      street-standards: street-standards,
      public-space-requirements: public-space-requirements,
      architectural-standards: architectural-standards,
      active: true
    })
    (var-set code-nonce code-id)
    (ok code-id)))

(define-public (submit-application (code-id uint) (project-description (string-ascii 500)) (compliance-checklist (string-ascii 500)))
  (begin
    (unwrap! (map-get? form-codes code-id) err-code-not-found)
    (ok (map-set development-applications {code-id: code-id, applicant: tx-sender} {
      project-description: project-description,
      compliance-checklist: compliance-checklist,
      status: "pending",
      submitted-at: stacks-block-height
    }))))

(define-public (review-application (code-id uint) (applicant principal) (status (string-ascii 20)))
  (let ((application (unwrap! (map-get? development-applications {code-id: code-id, applicant: applicant}) err-not-authorized)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set development-applications {code-id: code-id, applicant: applicant} 
      (merge application {status: status})))))

(define-public (update-code (code-id uint) (building-form (string-ascii 200)) (street-standards (string-ascii 200)))
  (let ((code (unwrap! (map-get? form-codes code-id) err-code-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set form-codes code-id 
      (merge code {building-form: building-form, street-standards: street-standards})))))
