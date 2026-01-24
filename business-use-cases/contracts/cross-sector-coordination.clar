(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-project-not-found (err u102))

(define-map projects uint {
  name: (string-ascii 100),
  sectors: (list 5 (string-ascii 50)),
  lead-sector: (string-ascii 50),
  budget: uint,
  status: (string-ascii 20)
})

(define-map sector-contributions {project-id: uint, sector: (string-ascii 50)} {
  contribution: uint,
  role: (string-ascii 100),
  completed: bool
})

(define-data-var project-nonce uint u0)
(define-map sector-coordinators principal (string-ascii 50))

(define-read-only (get-project (project-id uint))
  (ok (map-get? projects project-id)))

(define-read-only (get-sector-contribution (project-id uint) (sector (string-ascii 50)))
  (ok (map-get? sector-contributions {project-id: project-id, sector: sector})))

(define-read-only (get-coordinator-sector (coordinator principal))
  (ok (map-get? sector-coordinators coordinator)))

(define-public (register-coordinator (coordinator principal) (sector (string-ascii 50)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set sector-coordinators coordinator sector))))

(define-public (create-project (name (string-ascii 100)) (sectors (list 5 (string-ascii 50))) (lead-sector (string-ascii 50)) (budget uint))
  (let ((project-id (+ (var-get project-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set projects project-id {
      name: name,
      sectors: sectors,
      lead-sector: lead-sector,
      budget: budget,
      status: "active"
    })
    (var-set project-nonce project-id)
    (ok project-id)))

(define-public (set-sector-contribution (project-id uint) (sector (string-ascii 50)) (contribution uint) (role (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set sector-contributions {project-id: project-id, sector: sector} {
      contribution: contribution,
      role: role,
      completed: false
    }))))

(define-public (complete-sector-task (project-id uint))
  (let (
    (sector (unwrap! (map-get? sector-coordinators tx-sender) err-not-authorized))
    (contribution (unwrap! (map-get? sector-contributions {project-id: project-id, sector: sector}) err-not-authorized))
  )
    (ok (map-set sector-contributions {project-id: project-id, sector: sector} 
      (merge contribution {completed: true})))))

(define-public (update-project-status (project-id uint) (status (string-ascii 20)))
  (let ((project (unwrap! (map-get? projects project-id) err-project-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set projects project-id (merge project {status: status})))))
