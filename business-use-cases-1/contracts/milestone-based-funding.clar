(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-project-not-found (err u102))
(define-constant err-milestone-not-found (err u103))
(define-constant err-milestone-not-completed (err u104))

(define-map projects uint {
  name: (string-ascii 100),
  recipient: principal,
  total-funding: uint,
  released-funding: uint,
  active: bool
})

(define-map milestones {project-id: uint, milestone-id: uint} {
  description: (string-ascii 200),
  funding-amount: uint,
  completed: bool,
  verified: bool
})

(define-data-var project-nonce uint u0)

(define-read-only (get-project (project-id uint))
  (ok (map-get? projects project-id)))

(define-read-only (get-milestone (project-id uint) (milestone-id uint))
  (ok (map-get? milestones {project-id: project-id, milestone-id: milestone-id})))

(define-public (create-project (name (string-ascii 100)) (recipient principal) (total-funding uint))
  (let ((project-id (+ (var-get project-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set projects project-id {
      name: name,
      recipient: recipient,
      total-funding: total-funding,
      released-funding: u0,
      active: true
    })
    (var-set project-nonce project-id)
    (ok project-id)))

(define-public (add-milestone (project-id uint) (milestone-id uint) (description (string-ascii 200)) (funding-amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set milestones {project-id: project-id, milestone-id: milestone-id} {
      description: description,
      funding-amount: funding-amount,
      completed: false,
      verified: false
    }))))

(define-public (complete-milestone (project-id uint) (milestone-id uint))
  (let (
    (project (unwrap! (map-get? projects project-id) err-project-not-found))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-id: milestone-id}) err-milestone-not-found))
  )
    (asserts! (is-eq tx-sender (get recipient project)) err-not-authorized)
    (ok (map-set milestones {project-id: project-id, milestone-id: milestone-id} 
      (merge milestone {completed: true})))))

(define-public (verify-milestone (project-id uint) (milestone-id uint))
  (let (
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-id: milestone-id}) err-milestone-not-found))
  )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (get completed milestone) err-milestone-not-completed)
    (ok (map-set milestones {project-id: project-id, milestone-id: milestone-id} 
      (merge milestone {verified: true})))))

(define-public (release-funding (project-id uint) (milestone-id uint))
  (let (
    (project (unwrap! (map-get? projects project-id) err-project-not-found))
    (milestone (unwrap! (map-get? milestones {project-id: project-id, milestone-id: milestone-id}) err-milestone-not-found))
  )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (get verified milestone) err-milestone-not-completed)
    (ok (map-set projects project-id 
      (merge project {released-funding: (+ (get released-funding project) (get funding-amount milestone))})))))
