(define-constant contract-owner tx-sender)
(define-constant err-insufficient-balance (err u100))

(define-map carbon-balances principal uint)
(define-map carbon-trades uint {seller: principal, buyer: principal, amount: uint, price: uint, traded-at: uint})
(define-data-var trade-nonce uint u0)

(define-public (issue-carbon-credits (recipient principal) (amount uint))
  (let ((current-balance (default-to u0 (map-get? carbon-balances recipient))))
    (ok (map-set carbon-balances recipient (+ current-balance amount)))))

(define-public (trade-carbon (buyer principal) (amount uint) (price uint))
  (let ((seller-balance (default-to u0 (map-get? carbon-balances tx-sender)))
        (buyer-balance (default-to u0 (map-get? carbon-balances buyer)))
        (trade-id (var-get trade-nonce)))
    (asserts! (>= seller-balance amount) err-insufficient-balance)
    (map-set carbon-balances tx-sender (- seller-balance amount))
    (map-set carbon-balances buyer (+ buyer-balance amount))
    (map-set carbon-trades trade-id {seller: tx-sender, buyer: buyer, amount: amount, price: price, traded-at: stacks-block-height})
    (var-set trade-nonce (+ trade-id u1))
    (ok trade-id)))

(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? carbon-balances account))))

(define-read-only (get-trade (trade-id uint))
  (ok (map-get? carbon-trades trade-id)))
