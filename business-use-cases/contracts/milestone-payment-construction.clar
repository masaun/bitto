(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-paid (err u102))

(define-map construction-milestones
  { project-id: uint, milestone-id: uint }
  {
    description: (string-ascii 200),
    amount: uint,
    completed: bool,
    paid: bool,
    completed-at: uint
  }
)

(define-public (create-construction-milestone (project-id uint) (milestone-id uint) (description (string-ascii 200)) (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set construction-milestones { project-id: project-id, milestone-id: milestone-id }
      {
        description: description,
        amount: amount,
        completed: false,
        paid: false,
        completed-at: u0
      }
    )
    (ok true)
  )
)

(define-public (complete-construction-milestone (project-id uint) (milestone-id uint))
  (let ((milestone (unwrap! (map-get? construction-milestones { project-id: project-id, milestone-id: milestone-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set construction-milestones { project-id: project-id, milestone-id: milestone-id }
      (merge milestone { completed: true, completed-at: stacks-block-height })
    )
    (ok true)
  )
)

(define-public (pay-milestone (project-id uint) (milestone-id uint))
  (let ((milestone (unwrap! (map-get? construction-milestones { project-id: project-id, milestone-id: milestone-id }) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (get completed milestone) err-not-found)
    (asserts! (not (get paid milestone)) err-already-paid)
    (map-set construction-milestones { project-id: project-id, milestone-id: milestone-id }
      (merge milestone { paid: true })
    )
    (ok true)
  )
)

(define-read-only (get-construction-milestone (project-id uint) (milestone-id uint))
  (ok (map-get? construction-milestones { project-id: project-id, milestone-id: milestone-id }))
)
