(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-not-eligible (err u102))

(define-map grant-programs uint {
  program-name: (string-ascii 100),
  budget: uint,
  allocated: uint,
  min-farm-size: uint,
  min-sustainability-score: uint,
  active: bool,
  created-at: uint
})

(define-map grant-applications uint {
  program-id: uint,
  applicant: principal,
  farm-size: uint,
  sustainability-score: uint,
  requested-amount: uint,
  status: (string-ascii 20),
  applied-at: uint
})

(define-data-var program-nonce uint u0)
(define-data-var application-nonce uint u0)

(define-public (create-grant-program (name (string-ascii 100)) (budget uint) (min-size uint) (min-score uint))
  (let ((id (+ (var-get program-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set grant-programs id {
      program-name: name,
      budget: budget,
      allocated: u0,
      min-farm-size: min-size,
      min-sustainability-score: min-score,
      active: true,
      created-at: block-height
    })
    (var-set program-nonce id)
    (ok id)))

(define-public (apply-for-grant (program-id uint) (farm-size uint) (sust-score uint) (amount uint))
  (let ((program (unwrap! (map-get? grant-programs program-id) err-not-found))
        (id (+ (var-get application-nonce) u1))
        (eligible (and (>= farm-size (get min-farm-size program))
                      (>= sust-score (get min-sustainability-score program)))))
    (asserts! eligible err-not-eligible)
    (map-set grant-applications id {
      program-id: program-id,
      applicant: tx-sender,
      farm-size: farm-size,
      sustainability-score: sust-score,
      requested-amount: amount,
      status: "pending",
      applied-at: block-height
    })
    (var-set application-nonce id)
    (ok id)))

(define-public (approve-grant (app-id uint))
  (let ((app (unwrap! (map-get? grant-applications app-id) err-not-found))
        (program (unwrap! (map-get? grant-programs (get program-id app)) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set grant-applications app-id (merge app {status: "approved"}))
    (map-set grant-programs (get program-id app) 
             (merge program {allocated: (+ (get allocated program) (get requested-amount app))}))
    (ok true)))

(define-read-only (get-program (id uint))
  (ok (map-get? grant-programs id)))

(define-read-only (get-application (id uint))
  (ok (map-get? grant-applications id)))
