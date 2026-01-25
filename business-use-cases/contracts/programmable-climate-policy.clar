(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-policy-not-found (err u102))

(define-map climate-policies uint {
  name: (string-ascii 100),
  target-reduction: uint,
  current-reduction: uint,
  incentive-budget: uint,
  allocated-incentives: uint,
  active: bool
})

(define-map emissions-data principal {
  baseline: uint,
  current: uint,
  last-updated: uint
})

(define-map incentive-claims {policy-id: uint, claimant: principal} {
  amount: uint,
  verified: bool
})

(define-data-var policy-nonce uint u0)

(define-read-only (get-policy (policy-id uint))
  (ok (map-get? climate-policies policy-id)))

(define-read-only (get-emissions (entity principal))
  (ok (map-get? emissions-data entity)))

(define-public (create-policy (name (string-ascii 100)) (target-reduction uint) (incentive-budget uint))
  (let ((policy-id (+ (var-get policy-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set climate-policies policy-id {
      name: name,
      target-reduction: target-reduction,
      current-reduction: u0,
      incentive-budget: incentive-budget,
      allocated-incentives: u0,
      active: true
    })
    (var-set policy-nonce policy-id)
    (ok policy-id)))

(define-public (register-emissions (baseline uint))
  (begin
    (ok (map-set emissions-data tx-sender {
      baseline: baseline,
      current: baseline,
      last-updated: stacks-block-height
    }))))

(define-public (update-emissions (current uint))
  (let ((data (unwrap! (map-get? emissions-data tx-sender) err-not-authorized)))
    (ok (map-set emissions-data tx-sender 
      (merge data {current: current, last-updated: stacks-block-height})))))

(define-public (claim-incentive (policy-id uint))
  (let (
    (policy (unwrap! (map-get? climate-policies policy-id) err-policy-not-found))
    (emissions (unwrap! (map-get? emissions-data tx-sender) err-not-authorized))
  )
    (asserts! (get active policy) err-not-authorized)
    (let (
      (reduction (- (get baseline emissions) (get current emissions)))
      (incentive-amount (/ (* reduction (get incentive-budget policy)) (get target-reduction policy)))
    )
      (ok (map-set incentive-claims {policy-id: policy-id, claimant: tx-sender} {
        amount: incentive-amount,
        verified: false
      })))))

(define-public (verify-claim (policy-id uint) (claimant principal))
  (let ((claim (unwrap! (map-get? incentive-claims {policy-id: policy-id, claimant: claimant}) err-not-authorized)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set incentive-claims {policy-id: policy-id, claimant: claimant} 
      (merge claim {verified: true})))))
