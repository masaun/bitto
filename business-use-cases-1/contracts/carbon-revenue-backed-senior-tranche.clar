(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map senior-tranches uint {
  tranche-name: (string-ascii 100),
  total-value: uint,
  interest-rate: uint,
  maturity-date: uint,
  priority-level: uint,
  carbon-project-id: uint,
  issued-units: uint,
  created-at: uint
})

(define-map investor-holdings {investor: principal, tranche-id: uint} {
  units-held: uint,
  invested-amount: uint,
  accrued-interest: uint,
  last-payment: uint
})

(define-data-var tranche-nonce uint u0)

(define-public (issue-senior-tranche (name (string-ascii 100)) (value uint) (rate uint) (maturity uint) (project-id uint) (units uint))
  (let ((id (+ (var-get tranche-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set senior-tranches id {
      tranche-name: name,
      total-value: value,
      interest-rate: rate,
      maturity-date: maturity,
      priority-level: u1,
      carbon-project-id: project-id,
      issued-units: units,
      created-at: block-height
    })
    (var-set tranche-nonce id)
    (ok id)))

(define-public (invest-in-tranche (tranche-id uint) (units uint) (amount uint))
  (let ((tranche (unwrap! (map-get? senior-tranches tranche-id) err-not-found))
        (current (default-to {units-held: u0, invested-amount: u0, accrued-interest: u0, last-payment: u0}
                             (map-get? investor-holdings {investor: tx-sender, tranche-id: tranche-id}))))
    (map-set investor-holdings {investor: tx-sender, tranche-id: tranche-id} {
      units-held: (+ (get units-held current) units),
      invested-amount: (+ (get invested-amount current) amount),
      accrued-interest: (get accrued-interest current),
      last-payment: block-height
    })
    (ok true)))

(define-public (distribute-interest (tranche-id uint) (investor principal) (interest uint))
  (let ((holding (unwrap! (map-get? investor-holdings {investor: investor, tranche-id: tranche-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set investor-holdings {investor: investor, tranche-id: tranche-id} (merge holding {
      accrued-interest: (+ (get accrued-interest holding) interest),
      last-payment: block-height
    }))
    (ok true)))

(define-read-only (get-tranche (id uint))
  (ok (map-get? senior-tranches id)))

(define-read-only (get-holding (investor principal) (tranche-id uint))
  (ok (map-get? investor-holdings {investor: investor, tranche-id: tranche-id})))
