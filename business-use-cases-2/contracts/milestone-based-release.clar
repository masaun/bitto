(define-map milestones 
  {payment-id: uint, milestone-id: uint}
  {
    description: (string-ascii 128),
    amount: uint,
    completed: bool,
    released: bool
  }
)

(define-read-only (get-milestone (payment-id uint) (milestone-id uint))
  (map-get? milestones {payment-id: payment-id, milestone-id: milestone-id})
)

(define-public (create-milestone (payment-id uint) (milestone-id uint) (description (string-ascii 128)) (amount uint))
  (begin
    (map-set milestones {payment-id: payment-id, milestone-id: milestone-id} {
      description: description,
      amount: amount,
      completed: false,
      released: false
    })
    (ok true)
  )
)

(define-public (complete-milestone (payment-id uint) (milestone-id uint))
  (let ((milestone (unwrap! (map-get? milestones {payment-id: payment-id, milestone-id: milestone-id}) (err u1))))
    (map-set milestones {payment-id: payment-id, milestone-id: milestone-id} (merge milestone {completed: true}))
    (ok true)
  )
)

(define-public (release-milestone-payment (payment-id uint) (milestone-id uint))
  (let ((milestone (unwrap! (map-get? milestones {payment-id: payment-id, milestone-id: milestone-id}) (err u1))))
    (asserts! (get completed milestone) (err u2))
    (map-set milestones {payment-id: payment-id, milestone-id: milestone-id} (merge milestone {released: true}))
    (ok true)
  )
)
