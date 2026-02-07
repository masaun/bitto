(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))

(define-map projects
  { project-id: uint }
  {
    name: (string-ascii 100),
    classification-level: uint,
    status: (string-ascii 20),
    agency-id: uint,
    created-at: uint
  }
)

(define-data-var project-nonce uint u0)

(define-public (register-project (name (string-ascii 100)) (classification-level uint) (agency-id uint))
  (let ((project-id (+ (var-get project-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set projects { project-id: project-id }
      {
        name: name,
        classification-level: classification-level,
        status: "active",
        agency-id: agency-id,
        created-at: stacks-block-height
      }
    )
    (var-set project-nonce project-id)
    (ok project-id)
  )
)

(define-public (update-project-status (project-id uint) (status (string-ascii 20)))
  (let ((project (unwrap! (map-get? projects { project-id: project-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set projects { project-id: project-id } (merge project { status: status }))
    (ok true)
  )
)

(define-read-only (get-project (project-id uint))
  (ok (map-get? projects { project-id: project-id }))
)

(define-read-only (get-project-count)
  (ok (var-get project-nonce))
)
