(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)

(define-map resale-rights
  { nft-id: uint }
  {
    artist: principal,
    royalty-percentage: uint,
    active: bool
  }
)

(define-map resale-history
  { nft-id: uint, sale-id: uint }
  {
    seller: principal,
    buyer: principal,
    price: uint,
    artist-royalty: uint,
    block-height: uint
  }
)

(define-map nft-sale-count
  { nft-id: uint }
  uint
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-resale-rights (nft-id uint))
  (ok (map-get? resale-rights { nft-id: nft-id }))
)

(define-read-only (get-resale-history (nft-id uint) (sale-id uint))
  (ok (map-get? resale-history { nft-id: nft-id, sale-id: sale-id }))
)

(define-read-only (get-sale-count (nft-id uint))
  (ok (default-to u0 (map-get? nft-sale-count { nft-id: nft-id })))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-resale-rights
  (nft-id uint)
  (royalty-percentage uint)
)
  (begin
    (ok (map-set resale-rights { nft-id: nft-id } {
      artist: tx-sender,
      royalty-percentage: royalty-percentage,
      active: true
    }))
  )
)

(define-public (record-resale
  (nft-id uint)
  (buyer principal)
  (price uint)
)
  (let 
    (
      (rights (unwrap! (map-get? resale-rights { nft-id: nft-id }) ERR_NOT_FOUND))
      (sale-count (default-to u0 (map-get? nft-sale-count { nft-id: nft-id })))
      (sale-id (+ sale-count u1))
      (royalty-amount (/ (* price (get royalty-percentage rights)) u10000))
    )
    (map-set resale-history { nft-id: nft-id, sale-id: sale-id } {
      seller: tx-sender,
      buyer: buyer,
      price: price,
      artist-royalty: royalty-amount,
      block-height: stacks-block-height
    })
    (map-set nft-sale-count { nft-id: nft-id } sale-id)
    (ok sale-id)
  )
)

(define-public (update-royalty-percentage (nft-id uint) (new-percentage uint))
  (let ((rights (unwrap! (map-get? resale-rights { nft-id: nft-id }) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get artist rights)) ERR_UNAUTHORIZED)
    (ok (map-set resale-rights { nft-id: nft-id } (merge rights { royalty-percentage: new-percentage })))
  )
)
