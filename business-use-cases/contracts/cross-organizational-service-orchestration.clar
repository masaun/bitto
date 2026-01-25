(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-service-not-found (err u102))
(define-constant err-invalid-status (err u103))

(define-map services uint {
  name: (string-ascii 100),
  organizations: (list 10 principal),
  status: (string-ascii 20),
  start-height: uint,
  end-height: uint,
  budget: uint
})

(define-map org-roles {service-id: uint, organization: principal} {
  role: (string-ascii 50),
  completed: bool
})

(define-data-var service-nonce uint u0)

(define-read-only (get-service (service-id uint))
  (ok (map-get? services service-id)))

(define-read-only (get-org-role (service-id uint) (organization principal))
  (ok (map-get? org-roles {service-id: service-id, organization: organization})))

(define-public (create-service (name (string-ascii 100)) (organizations (list 10 principal)) (budget uint) (duration uint))
  (let ((service-id (+ (var-get service-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set services service-id {
      name: name,
      organizations: organizations,
      status: "pending",
      start-height: stacks-block-height,
      end-height: (+ stacks-block-height duration),
      budget: budget
    })
    (var-set service-nonce service-id)
    (ok service-id)))

(define-public (assign-role (service-id uint) (organization principal) (role (string-ascii 50)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set org-roles {service-id: service-id, organization: organization} {
      role: role,
      completed: false
    }))))

(define-public (complete-role (service-id uint))
  (let ((role-data (unwrap! (map-get? org-roles {service-id: service-id, organization: tx-sender}) err-not-authorized)))
    (ok (map-set org-roles {service-id: service-id, organization: tx-sender} 
      (merge role-data {completed: true})))))

(define-public (update-service-status (service-id uint) (status (string-ascii 20)))
  (let ((service (unwrap! (map-get? services service-id) err-service-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set services service-id (merge service {status: status})))))
