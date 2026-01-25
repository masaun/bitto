(define-fungible-token cbdc)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-frozen (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-compliance-check-failed (err u104))

(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var compliance-enabled bool true)

(define-map frozen principal bool)
(define-map daily-limits principal uint)
(define-map daily-spent principal {amount: uint, day: uint})
(define-map authorized-minters principal bool)
(define-map compliance-officers principal bool)

(define-read-only (get-name)
  (ok "Central Bank Digital Currency"))

(define-read-only (get-symbol)
  (ok "CBDC"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance cbdc account)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply cbdc)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-read-only (is-frozen (account principal))
  (default-to false (map-get? frozen account)))

(define-read-only (get-daily-limit (account principal))
  (default-to u0 (map-get? daily-limits account)))

(define-read-only (is-compliance-officer (account principal))
  (default-to false (map-get? compliance-officers account)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (not (is-frozen sender)) err-frozen)
    (asserts! (not (is-frozen recipient)) err-frozen)
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (check-daily-limit sender amount))
    (try! (ft-transfer? cbdc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)))

(define-private (check-daily-limit (account principal) (amount uint))
  (let (
    (limit (get-daily-limit account))
    (current-day (/ stacks-block-height u144))
    (spent-data (default-to {amount: u0, day: u0} (map-get? daily-spent account)))
  )
    (if (is-eq limit u0)
      (ok true)
      (if (is-eq (get day spent-data) current-day)
        (let ((new-amount (+ (get amount spent-data) amount)))
          (asserts! (<= new-amount limit) err-compliance-check-failed)
          (ok (map-set daily-spent account {amount: new-amount, day: current-day})))
        (begin
          (asserts! (<= amount limit) err-compliance-check-failed)
          (ok (map-set daily-spent account {amount: amount, day: current-day})))))))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (default-to false (map-get? authorized-minters tx-sender))) err-owner-only)
    (asserts! (not (is-frozen recipient)) err-frozen)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-mint? cbdc amount recipient)))

(define-public (burn (amount uint))
  (begin
    (asserts! (not (is-frozen tx-sender)) err-frozen)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-burn? cbdc amount tx-sender)))

(define-public (freeze-account (account principal))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (is-compliance-officer tx-sender)) err-owner-only)
    (ok (map-set frozen account true))))

(define-public (unfreeze-account (account principal))
  (begin
    (asserts! (or (is-eq tx-sender contract-owner) (is-compliance-officer tx-sender)) err-owner-only)
    (ok (map-delete frozen account))))

(define-public (set-daily-limit (account principal) (limit uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set daily-limits account limit))))

(define-public (add-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set authorized-minters minter true))))

(define-public (remove-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete authorized-minters minter))))

(define-public (add-compliance-officer (officer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set compliance-officers officer true))))

(define-public (remove-compliance-officer (officer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-delete compliance-officers officer))))

(define-public (set-token-uri (value (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set token-uri (some value)))))
