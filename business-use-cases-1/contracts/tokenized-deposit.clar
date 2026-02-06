(define-fungible-token tokenized-deposit)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-invalid-amount (err u102))
(define-constant err-deposit-locked (err u103))
(define-constant err-bank-not-authorized (err u104))

(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var interest-rate uint u500)

(define-map deposits principal {amount: uint, locked-until: uint, interest-accrued: uint})
(define-map authorized-banks principal bool)
(define-map bank-reserves principal uint)

(define-read-only (get-name)
  (ok "Tokenized Bank Deposit"))

(define-read-only (get-symbol)
  (ok "TBD"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance tokenized-deposit account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply tokenized-deposit)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-read-only (get-deposit-info (account principal))
  (ok (map-get? deposits account)))

(define-read-only (get-interest-rate)
  (ok (var-get interest-rate)))

(define-read-only (is-authorized-bank (bank principal))
  (default-to false (map-get? authorized-banks bank)))

(define-read-only (get-bank-reserves (bank principal))
  (default-to u0 (map-get? bank-reserves bank)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (check-unlock-status sender))
    (try! (ft-transfer? tokenized-deposit amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-private (check-unlock-status (account principal))
  (let ((deposit-info (map-get? deposits account)))
    (match deposit-info
      info (if (> (get locked-until info) stacks-stacks-block-height)
             err-deposit-locked
             (ok true))
      (ok true))))

(define-public (create-deposit (amount uint) (lock-period uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-mint? tokenized-deposit amount tx-sender))
    (ok (map-set deposits tx-sender {
      amount: amount,
      locked-until: (+ stacks-stacks-block-height lock-period),
      interest-accrued: u0
    }))))

(define-public (withdraw-deposit)
  (let ((deposit-info (unwrap! (map-get? deposits tx-sender) err-not-authorized)))
    (asserts! (<= (get locked-until deposit-info) stacks-stacks-block-height) err-deposit-locked)
    (try! (ft-burn? tokenized-deposit (get amount deposit-info) tx-sender))
    (ok (map-delete deposits tx-sender))))

(define-public (calculate-interest (account principal))
  (let ((deposit-info (unwrap! (map-get? deposits account) err-not-authorized)))
    (let ((interest (/ (* (get amount deposit-info) (var-get interest-rate)) u10000)))
      (ok (map-set deposits account (merge deposit-info {interest-accrued: (+ (get interest-accrued deposit-info) interest)}))))))

(define-public (mint-by-bank (amount uint) (recipient principal))
  (begin
    (asserts! (is-authorized-bank tx-sender) err-bank-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? tokenized-deposit amount recipient)))

(define-public (burn-by-bank (amount uint) (account principal))
  (begin
    (asserts! (is-authorized-bank tx-sender) err-bank-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? tokenized-deposit amount account)))

(define-public (set-interest-rate (rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set interest-rate rate))))

(define-public (add-authorized-bank (bank principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-banks bank true))))

(define-public (remove-authorized-bank (bank principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete authorized-banks bank))))

(define-public (update-bank-reserves (bank principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set bank-reserves bank amount))))

(define-public (set-token-uri (value (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set token-uri (some value)))))
