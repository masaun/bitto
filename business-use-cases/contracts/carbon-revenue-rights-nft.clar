(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map carbon-nfts uint {
  token-id: uint,
  owner: principal,
  project-id: uint,
  revenue-share: uint,
  total-revenue: uint,
  claimed-revenue: uint,
  metadata-uri: (string-ascii 200),
  minted-at: uint
})

(define-map revenue-claims uint {
  nft-id: uint,
  claimer: principal,
  amount: uint,
  claimed-at: uint
})

(define-data-var nft-nonce uint u0)
(define-data-var claim-nonce uint u0)

(define-public (mint-carbon-nft (project-id uint) (revenue-share uint) (metadata (string-ascii 200)))
  (let ((id (+ (var-get nft-nonce) u1)))
    (map-set carbon-nfts id {
      token-id: id,
      owner: tx-sender,
      project-id: project-id,
      revenue-share: revenue-share,
      total-revenue: u0,
      claimed-revenue: u0,
      metadata-uri: metadata,
      minted-at: block-height
    })
    (var-set nft-nonce id)
    (ok id)))

(define-public (transfer-nft (nft-id uint) (recipient principal))
  (let ((nft (unwrap! (map-get? carbon-nfts nft-id) err-not-found)))
    (asserts! (is-eq tx-sender (get owner nft)) err-unauthorized)
    (map-set carbon-nfts nft-id (merge nft {owner: recipient}))
    (ok true)))

(define-public (claim-revenue (nft-id uint) (amount uint))
  (let ((nft (unwrap! (map-get? carbon-nfts nft-id) err-not-found))
        (claim-id (+ (var-get claim-nonce) u1))
        (available (- (get total-revenue nft) (get claimed-revenue nft))))
    (asserts! (is-eq tx-sender (get owner nft)) err-unauthorized)
    (asserts! (<= amount available) err-unauthorized)
    (map-set carbon-nfts nft-id (merge nft {
      claimed-revenue: (+ (get claimed-revenue nft) amount)
    }))
    (map-set revenue-claims claim-id {
      nft-id: nft-id,
      claimer: tx-sender,
      amount: amount,
      claimed-at: block-height
    })
    (var-set claim-nonce claim-id)
    (ok amount)))

(define-public (update-nft-revenue (nft-id uint) (revenue uint))
  (let ((nft (unwrap! (map-get? carbon-nfts nft-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set carbon-nfts nft-id (merge nft {total-revenue: revenue}))
    (ok true)))

(define-read-only (get-nft (id uint))
  (ok (map-get? carbon-nfts id)))

(define-read-only (get-claim (id uint))
  (ok (map-get? revenue-claims id)))
