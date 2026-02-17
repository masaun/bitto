(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))

(define-map properties uint {owner: principal, location: (string-ascii 64), value: uint, shares: uint, tokenized: bool})
(define-map property-shares {property-id: uint, holder: principal} uint)
(define-data-var property-nonce uint u0)

(define-public (tokenize-property (location (string-ascii 64)) (value uint) (shares uint))
  (let ((id (var-get property-nonce)))
    (map-set properties id {owner: tx-sender, location: location, value: value, shares: shares, tokenized: true})
    (map-set property-shares {property-id: id, holder: tx-sender} shares)
    (var-set property-nonce (+ id u1))
    (ok id)))

(define-public (transfer-shares (property-id uint) (recipient principal) (amount uint))
  (let ((sender-shares (default-to u0 (map-get? property-shares {property-id: property-id, holder: tx-sender})))
        (recipient-shares (default-to u0 (map-get? property-shares {property-id: property-id, holder: recipient}))))
    (asserts! (>= sender-shares amount) err-not-owner)
    (map-set property-shares {property-id: property-id, holder: tx-sender} (- sender-shares amount))
    (map-set property-shares {property-id: property-id, holder: recipient} (+ recipient-shares amount))
    (ok true)))

(define-read-only (get-property (property-id uint))
  (ok (map-get? properties property-id)))

(define-read-only (get-shares (property-id uint) (holder principal))
  (ok (default-to u0 (map-get? property-shares {property-id: property-id, holder: holder}))))
