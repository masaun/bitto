(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-market-closed (err u102))
(define-constant err-insufficient-liquidity (err u103))

(define-map markets uint {sport: (string-ascii 40), match-id: uint, total-pool: uint, active: bool})
(define-map positions {market-id: uint, bettor: principal} {amount: uint, outcome: (string-ascii 20), settled: bool})
(define-data-var market-nonce uint u0)
(define-data-var liquidity-pool uint u0)

(define-read-only (get-market (market-id uint))
  (map-get? markets market-id))

(define-read-only (get-position (market-id uint) (bettor principal))
  (map-get? positions {market-id: market-id, bettor: bettor}))

(define-read-only (get-liquidity-pool)
  (ok (var-get liquidity-pool)))

(define-public (create-market (sport (string-ascii 40)) (match-id uint))
  (let ((market-id (+ (var-get market-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set markets market-id {sport: sport, match-id: match-id, total-pool: u0, active: true})
    (var-set market-nonce market-id)
    (ok market-id)))

(define-public (place-bet (market-id uint) (amount uint) (outcome (string-ascii 20)))
  (let ((market (unwrap! (map-get? markets market-id) err-not-found)))
    (asserts! (get active market) err-market-closed)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set markets market-id (merge market {total-pool: (+ (get total-pool market) amount)}))
    (map-set positions {market-id: market-id, bettor: tx-sender} {amount: amount, outcome: outcome, settled: false})
    (var-set liquidity-pool (+ (var-get liquidity-pool) amount))
    (ok true)))

(define-public (settle-market (market-id uint))
  (let ((market (unwrap! (map-get? markets market-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set markets market-id (merge market {active: false}))
    (ok true)))

(define-public (add-liquidity (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set liquidity-pool (+ (var-get liquidity-pool) amount))
    (ok true)))
