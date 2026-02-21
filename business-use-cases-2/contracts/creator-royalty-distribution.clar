(define-constant contract-owner tx-sender)
(define-constant err-insufficient-balance (err u100))

(define-map creators principal {total-earned: uint, registered-at: uint})
(define-map royalty-shares uint {creator: principal, content-id: (string-ascii 64), share-percentage: uint, amount: uint, distributed-at: uint})
(define-data-var share-nonce uint u0)

(define-public (register-creator)
  (ok (map-set creators tx-sender {total-earned: u0, registered-at: stacks-block-height})))

(define-public (distribute-royalty (creator principal) (content-id (string-ascii 64)) (share-pct uint) (amount uint))
  (let ((id (var-get share-nonce))
        (creator-data (default-to {total-earned: u0, registered-at: u0} (map-get? creators creator))))
    (map-set royalty-shares id {creator: creator, content-id: content-id, share-percentage: share-pct, amount: amount, distributed-at: stacks-block-height})
    (map-set creators creator (merge creator-data {total-earned: (+ (get total-earned creator-data) amount)}))
    (var-set share-nonce (+ id u1))
    (ok id)))

(define-read-only (get-creator (creator principal))
  (ok (map-get? creators creator)))

(define-read-only (get-royalty-share (id uint))
  (ok (map-get? royalty-shares id)))
