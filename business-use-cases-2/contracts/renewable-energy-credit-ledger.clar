(define-constant contract-owner tx-sender)
(define-constant err-insufficient-balance (err u100))

(define-map energy-credits principal uint)
(define-map credit-issuances uint {recipient: principal, amount: uint, source: (string-ascii 64), issued-at: uint})
(define-data-var issuance-nonce uint u0)

(define-public (issue-credits (recipient principal) (amount uint) (source (string-ascii 64)))
  (let ((id (var-get issuance-nonce))
        (current-balance (default-to u0 (map-get? energy-credits recipient))))
    (map-set energy-credits recipient (+ current-balance amount))
    (map-set credit-issuances id {recipient: recipient, amount: amount, source: source, issued-at: stacks-block-height})
    (var-set issuance-nonce (+ id u1))
    (ok id)))

(define-public (transfer-credits (recipient principal) (amount uint))
  (let ((sender-balance (default-to u0 (map-get? energy-credits tx-sender)))
        (recipient-balance (default-to u0 (map-get? energy-credits recipient))))
    (asserts! (>= sender-balance amount) err-insufficient-balance)
    (map-set energy-credits tx-sender (- sender-balance amount))
    (map-set energy-credits recipient (+ recipient-balance amount))
    (ok true)))

(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? energy-credits account))))

(define-read-only (get-issuance (id uint))
  (ok (map-get? credit-issuances id)))
