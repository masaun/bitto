(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map junior-tranches uint {
  tranche-name: (string-ascii 100),
  total-value: uint,
  expected-return: uint,
  maturity-date: uint,
  priority-level: uint,
  carbon-project-id: uint,
  issued-units: uint,
  created-at: uint
})

(define-map investor-positions {investor: principal, tranche-id: uint} {
  units-held: uint,
  invested-amount: uint,
  realized-gains: uint,
  last-distribution: uint
})

(define-data-var tranche-nonce uint u0)

(define-public (issue-junior-tranche (name (string-ascii 100)) (value uint) (expected-ret uint) (maturity uint) (project-id uint) (units uint))
  (let ((id (+ (var-get tranche-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set junior-tranches id {
      tranche-name: name,
      total-value: value,
      expected-return: expected-ret,
      maturity-date: maturity,
      priority-level: u2,
      carbon-project-id: project-id,
      issued-units: units,
      created-at: block-height
    })
    (var-set tranche-nonce id)
    (ok id)))

(define-public (invest-in-junior-tranche (tranche-id uint) (units uint) (amount uint))
  (let ((tranche (unwrap! (map-get? junior-tranches tranche-id) err-not-found))
        (current (default-to {units-held: u0, invested-amount: u0, realized-gains: u0, last-distribution: u0}
                             (map-get? investor-positions {investor: tx-sender, tranche-id: tranche-id}))))
    (map-set investor-positions {investor: tx-sender, tranche-id: tranche-id} {
      units-held: (+ (get units-held current) units),
      invested-amount: (+ (get invested-amount current) amount),
      realized-gains: (get realized-gains current),
      last-distribution: block-height
    })
    (ok true)))

(define-public (distribute-returns (tranche-id uint) (investor principal) (gains uint))
  (let ((position (unwrap! (map-get? investor-positions {investor: investor, tranche-id: tranche-id}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set investor-positions {investor: investor, tranche-id: tranche-id} (merge position {
      realized-gains: (+ (get realized-gains position) gains),
      last-distribution: block-height
    }))
    (ok true)))

(define-read-only (get-tranche (id uint))
  (ok (map-get? junior-tranches id)))

(define-read-only (get-position (investor principal) (tranche-id uint))
  (ok (map-get? investor-positions {investor: investor, tranche-id: tranche-id})))
