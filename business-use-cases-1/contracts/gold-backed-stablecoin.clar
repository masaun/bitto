(define-fungible-token usdkg)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-frozen (err u104))

(define-data-var gold-reserves uint u0)
(define-data-var token-uri (optional (string-utf8 256)) none)

(define-map frozen principal bool)
(define-map auditors principal bool)

(define-read-only (get-name)
  (ok "USD Gold-Backed Kyrgyzstan"))

(define-read-only (get-symbol)
  (ok "USDKG"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance usdkg account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply usdkg)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-read-only (get-gold-reserves)
  (ok (var-get gold-reserves)))

(define-read-only (is-frozen (account principal))
  (default-to false (map-get? frozen account)))

(define-read-only (is-auditor (account principal))
  (default-to false (map-get? auditors account)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (not (is-frozen sender)) err-frozen)
    (asserts! (not (is-frozen recipient)) err-frozen)
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (try! (ft-transfer? usdkg amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (is-frozen recipient)) err-frozen)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? usdkg amount recipient)))

(define-public (burn (amount uint))
  (begin
    (asserts! (not (is-frozen tx-sender)) err-frozen)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? usdkg amount tx-sender)))

(define-public (update-gold-reserves (amount uint))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (is-auditor tx-sender)) err-owner-only)
    (ok (var-set gold-reserves amount))))

(define-public (freeze-account (account principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set frozen account true))))

(define-public (unfreeze-account (account principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete frozen account))))

(define-public (add-auditor (auditor principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set auditors auditor true))))

(define-public (remove-auditor (auditor principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete auditors auditor))))

(define-public (set-token-uri (value (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set token-uri (some value)))))
