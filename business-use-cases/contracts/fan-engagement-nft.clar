(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_MINTED (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var nft-nonce uint u0)

(define-map nfts
  uint
  {
    artist: principal,
    owner: principal,
    nft-type: (string-ascii 20),
    metadata-uri: (string-utf8 256),
    minted-at: uint,
    transferable: bool
  }
)

(define-map fan-memberships
  { fan: principal, artist: principal }
  {
    tier: (string-ascii 20),
    expires-at: uint,
    active: bool
  }
)

(define-map nft-ownership
  { nft-id: uint }
  principal
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-nft (nft-id uint))
  (ok (map-get? nfts nft-id))
)

(define-read-only (get-nft-owner (nft-id uint))
  (ok (map-get? nft-ownership { nft-id: nft-id }))
)

(define-read-only (get-fan-membership (fan principal) (artist principal))
  (ok (map-get? fan-memberships { fan: fan, artist: artist }))
)

(define-read-only (get-nft-nonce)
  (ok (var-get nft-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (mint-nft
  (nft-type (string-ascii 20))
  (metadata-uri (string-utf8 256))
  (recipient principal)
  (transferable bool)
)
  (let ((nft-id (+ (var-get nft-nonce) u1)))
    (map-set nfts nft-id {
      artist: tx-sender,
      owner: recipient,
      nft-type: nft-type,
      metadata-uri: metadata-uri,
      minted-at: stacks-block-height,
      transferable: transferable
    })
    (map-set nft-ownership { nft-id: nft-id } recipient)
    (var-set nft-nonce nft-id)
    (ok nft-id)
  )
)

(define-public (create-membership
  (fan principal)
  (tier (string-ascii 20))
  (duration-blocks uint)
)
  (begin
    (ok (map-set fan-memberships { fan: fan, artist: tx-sender } {
      tier: tier,
      expires-at: (+ stacks-block-height duration-blocks),
      active: true
    }))
  )
)

(define-public (transfer-nft (nft-id uint) (recipient principal))
  (let ((nft (unwrap! (map-get? nfts nft-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get owner nft)) ERR_UNAUTHORIZED)
    (asserts! (get transferable nft) ERR_UNAUTHORIZED)
    (map-set nfts nft-id (merge nft { owner: recipient }))
    (ok (map-set nft-ownership { nft-id: nft-id } recipient))
  )
)
