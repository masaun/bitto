(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-zone-not-found (err u102))

(define-map zones uint {
  location: (string-ascii 100),
  base-zoning: (string-ascii 50),
  incentive-program: (string-ascii 200),
  bonus-available: uint,
  conditions: (string-ascii 500)
})

(define-map developer-proposals {zone-id: uint, developer: principal} {
  proposal: (string-ascii 500),
  bonus-requested: uint,
  public-benefit: (string-ascii 500),
  status: (string-ascii 20)
})

(define-data-var zone-nonce uint u0)

(define-read-only (get-zone (zone-id uint))
  (ok (map-get? zones zone-id)))

(define-read-only (get-proposal (zone-id uint) (developer principal))
  (ok (map-get? developer-proposals {zone-id: zone-id, developer: developer})))

(define-public (create-zone (location (string-ascii 100)) (base-zoning (string-ascii 50)) (incentive-program (string-ascii 200)) (bonus-available uint) (conditions (string-ascii 500)))
  (let ((zone-id (+ (var-get zone-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set zones zone-id {
      location: location,
      base-zoning: base-zoning,
      incentive-program: incentive-program,
      bonus-available: bonus-available,
      conditions: conditions
    })
    (var-set zone-nonce zone-id)
    (ok zone-id)))

(define-public (submit-proposal (zone-id uint) (proposal (string-ascii 500)) (bonus-requested uint) (public-benefit (string-ascii 500)))
  (let ((zone (unwrap! (map-get? zones zone-id) err-zone-not-found)))
    (asserts! (<= bonus-requested (get bonus-available zone)) err-not-authorized)
    (ok (map-set developer-proposals {zone-id: zone-id, developer: tx-sender} {
      proposal: proposal,
      bonus-requested: bonus-requested,
      public-benefit: public-benefit,
      status: "pending"
    }))))

(define-public (approve-proposal (zone-id uint) (developer principal))
  (let ((proposal (unwrap! (map-get? developer-proposals {zone-id: zone-id, developer: developer}) err-not-authorized)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set developer-proposals {zone-id: zone-id, developer: developer} 
      (merge proposal {status: "approved"})))))

(define-public (reject-proposal (zone-id uint) (developer principal))
  (let ((proposal (unwrap! (map-get? developer-proposals {zone-id: zone-id, developer: developer}) err-not-authorized)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set developer-proposals {zone-id: zone-id, developer: developer} 
      (merge proposal {status: "rejected"})))))
