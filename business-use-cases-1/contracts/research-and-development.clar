(define-map projects
  { project-id: uint }
  {
    name: (string-ascii 100),
    lead-researcher: principal,
    objective: (string-ascii 200),
    status: (string-ascii 20),
    started-at: uint,
    budget: uint
  }
)

(define-data-var project-nonce uint u0)

(define-public (create-project (name (string-ascii 100)) (objective (string-ascii 200)) (budget uint))
  (let ((project-id (+ (var-get project-nonce) u1)))
    (map-set projects
      { project-id: project-id }
      {
        name: name,
        lead-researcher: tx-sender,
        objective: objective,
        status: "active",
        started-at: stacks-block-height,
        budget: budget
      }
    )
    (var-set project-nonce project-id)
    (ok project-id)
  )
)

(define-public (update-project-status (project-id uint) (new-status (string-ascii 20)))
  (match (map-get? projects { project-id: project-id })
    project (ok (map-set projects { project-id: project-id } (merge project { status: new-status })))
    (err u404)
  )
)

(define-read-only (get-project (project-id uint))
  (map-get? projects { project-id: project-id })
)
