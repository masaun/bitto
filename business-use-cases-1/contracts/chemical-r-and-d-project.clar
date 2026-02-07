(define-constant err-already-exists (err u100))
(define-constant err-not-found (err u101))

(define-map projects
  { project-id: (string-ascii 50) }
  {
    project-name: (string-ascii 100),
    project-lead: principal,
    start-date: uint,
    target-completion: uint,
    budget: uint,
    status: (string-ascii 20),
    project-goal: (string-ascii 200),
    created-at: uint
  }
)

(define-public (create-project (project-id (string-ascii 50)) (project-name (string-ascii 100)) (project-lead principal) (target-completion uint) (budget uint) (project-goal (string-ascii 200)))
  (begin
    (asserts! (is-none (map-get? projects { project-id: project-id })) err-already-exists)
    (ok (map-set projects
      { project-id: project-id }
      {
        project-name: project-name,
        project-lead: project-lead,
        start-date: stacks-block-height,
        target-completion: target-completion,
        budget: budget,
        status: "active",
        project-goal: project-goal,
        created-at: stacks-block-height
      }
    ))
  )
)

(define-public (update-project-status (project-id (string-ascii 50)) (status (string-ascii 20)))
  (let ((project (unwrap! (map-get? projects { project-id: project-id }) err-not-found)))
    (ok (map-set projects
      { project-id: project-id }
      (merge project { status: status })
    ))
  )
)

(define-read-only (get-project (project-id (string-ascii 50)))
  (map-get? projects { project-id: project-id })
)
