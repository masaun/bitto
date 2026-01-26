(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-initiative-not-found (err u102))
(define-constant err-agency-not-registered (err u103))

(define-map initiatives uint {
  name: (string-ascii 100),
  lead-agency: principal,
  agencies: (list 10 principal),
  budget: uint,
  status: (string-ascii 20),
  start-height: uint
})

(define-map agency-tasks {initiative-id: uint, agency: principal} {
  task: (string-ascii 200),
  completed: bool,
  budget-allocated: uint
})

(define-data-var initiative-nonce uint u0)
(define-map registered-agencies principal bool)

(define-read-only (get-initiative (initiative-id uint))
  (ok (map-get? initiatives initiative-id)))

(define-read-only (get-agency-task (initiative-id uint) (agency principal))
  (ok (map-get? agency-tasks {initiative-id: initiative-id, agency: agency})))

(define-read-only (is-registered-agency (agency principal))
  (default-to false (map-get? registered-agencies agency)))

(define-public (register-agency (agency principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set registered-agencies agency true))))

(define-public (create-initiative (name (string-ascii 100)) (agencies (list 10 principal)) (budget uint))
  (let ((initiative-id (+ (var-get initiative-nonce) u1)))
    (asserts! (is-registered-agency tx-sender) err-agency-not-registered)
    (map-set initiatives initiative-id {
      name: name,
      lead-agency: tx-sender,
      agencies: agencies,
      budget: budget,
      status: "active",
      start-height: stacks-stacks-block-height
    })
    (var-set initiative-nonce initiative-id)
    (ok initiative-id)))

(define-public (assign-task (initiative-id uint) (agency principal) (task (string-ascii 200)) (budget-allocated uint))
  (let ((initiative (unwrap! (map-get? initiatives initiative-id) err-initiative-not-found)))
    (asserts! (is-eq tx-sender (get lead-agency initiative)) err-not-authorized)
    (ok (map-set agency-tasks {initiative-id: initiative-id, agency: agency} {
      task: task,
      completed: false,
      budget-allocated: budget-allocated
    }))))

(define-public (complete-task (initiative-id uint))
  (let ((task (unwrap! (map-get? agency-tasks {initiative-id: initiative-id, agency: tx-sender}) err-not-authorized)))
    (ok (map-set agency-tasks {initiative-id: initiative-id, agency: tx-sender} 
      (merge task {completed: true})))))

(define-public (update-initiative-status (initiative-id uint) (status (string-ascii 20)))
  (let ((initiative (unwrap! (map-get? initiatives initiative-id) err-initiative-not-found)))
    (asserts! (is-eq tx-sender (get lead-agency initiative)) err-not-authorized)
    (ok (map-set initiatives initiative-id (merge initiative {status: status})))))
