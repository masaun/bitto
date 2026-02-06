(define-fungible-token city-token)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-insufficient-balance (err u102))

(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var city-name (string-ascii 50) "")

(define-map stakes principal {
  amount: uint,
  start-height: uint,
  rewards: uint
})

(define-map proposals uint {
  proposer: principal,
  description: (string-ascii 500),
  yes-votes: uint,
  no-votes: uint,
  end-height: uint,
  executed: bool
})

(define-data-var proposal-nonce uint u0)

(define-read-only (get-name)
  (ok "City Token"))

(define-read-only (get-symbol)
  (ok "CITY"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance city-token account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply city-token)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-read-only (get-stake (account principal))
  (ok (map-get? stakes account)))

(define-read-only (get-proposal (proposal-id uint))
  (ok (map-get? proposals proposal-id)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (try! (ft-transfer? city-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? city-token amount recipient)))

(define-public (stake (amount uint))
  (begin
    (try! (ft-burn? city-token amount tx-sender))
    (let ((current-stake (default-to {amount: u0, start-height: u0, rewards: u0} (map-get? stakes tx-sender))))
      (ok (map-set stakes tx-sender {
        amount: (+ (get amount current-stake) amount),
        start-height: stacks-stacks-block-height,
        rewards: (get rewards current-stake)
      })))))

(define-public (unstake (amount uint))
  (let ((stake-data (unwrap! (map-get? stakes tx-sender) err-not-authorized)))
    (asserts! (>= (get amount stake-data) amount) err-insufficient-balance)
    (try! (ft-mint? city-token amount tx-sender))
    (ok (map-set stakes tx-sender 
      (merge stake-data {amount: (- (get amount stake-data) amount)})))))

(define-public (create-proposal (description (string-ascii 500)))
  (let ((proposal-id (+ (var-get proposal-nonce) u1)))
    (map-set proposals proposal-id {
      proposer: tx-sender,
      description: description,
      yes-votes: u0,
      no-votes: u0,
      end-height: (+ stacks-stacks-block-height u1440),
      executed: false
    })
    (var-set proposal-nonce proposal-id)
    (ok proposal-id)))

(define-public (vote (proposal-id uint) (vote-yes bool))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) err-not-authorized))
    (stake-data (unwrap! (map-get? stakes tx-sender) err-not-authorized))
    (vote-weight (get amount stake-data))
  )
    (asserts! (< stacks-stacks-block-height (get end-height proposal)) err-not-authorized)
    (if vote-yes
      (ok (map-set proposals proposal-id 
        (merge proposal {yes-votes: (+ (get yes-votes proposal) vote-weight)})))
      (ok (map-set proposals proposal-id 
        (merge proposal {no-votes: (+ (get no-votes proposal) vote-weight)}))))))
