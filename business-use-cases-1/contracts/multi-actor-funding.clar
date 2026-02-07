(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-project-not-found (err u102))

(define-map projects uint {
  name: (string-ascii 100),
  total-funding: uint,
  raised: uint,
  funders: (list 20 principal),
  active: bool
})

(define-map contributions {project-id: uint, funder: principal} {
  amount: uint,
  share: uint
})

(define-data-var project-nonce uint u0)

(define-read-only (get-project (project-id uint))
  (ok (map-get? projects project-id)))

(define-read-only (get-contribution (project-id uint) (funder principal))
  (ok (map-get? contributions {project-id: project-id, funder: funder})))

(define-public (create-project (name (string-ascii 100)) (total-funding uint))
  (let ((project-id (+ (var-get project-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set projects project-id {
      name: name,
      total-funding: total-funding,
      raised: u0,
      funders: (list),
      active: true
    })
    (var-set project-nonce project-id)
    (ok project-id)))

(define-public (contribute (project-id uint) (amount uint))
  (let ((project (unwrap! (map-get? projects project-id) err-project-not-found)))
    (asserts! (get active project) err-not-authorized)
    (let (
      (new-raised (+ (get raised project) amount))
      (share (/ (* amount u10000) (get total-funding project)))
    )
      (map-set contributions {project-id: project-id, funder: tx-sender} {
        amount: amount,
        share: share
      })
      (ok (map-set projects project-id 
        (merge project {raised: new-raised}))))))

(define-public (close-project (project-id uint))
  (let ((project (unwrap! (map-get? projects project-id) err-project-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set projects project-id (merge project {active: false})))))
