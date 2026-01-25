(define-non-fungible-token local-art uint)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-nft-not-found (err u102))
(define-constant err-already-exists (err u103))

(define-map art-metadata uint {
  title: (string-ascii 100),
  artist: principal,
  uri: (string-ascii 200),
  funding-goal: uint,
  funding-raised: uint,
  royalty-rate: uint
})

(define-map funders {nft-id: uint, funder: principal} uint)
(define-data-var nft-nonce uint u0)

(define-read-only (get-last-token-id)
  (ok (var-get nft-nonce)))

(define-read-only (get-token-uri (nft-id uint))
  (ok (some (get uri (unwrap! (map-get? art-metadata nft-id) err-nft-not-found)))))

(define-read-only (get-owner (nft-id uint))
  (ok (nft-get-owner? local-art nft-id)))

(define-read-only (get-art-metadata (nft-id uint))
  (ok (map-get? art-metadata nft-id)))

(define-read-only (get-funding (nft-id uint) (funder principal))
  (ok (default-to u0 (map-get? funders {nft-id: nft-id, funder: funder}))))

(define-public (mint-art (title (string-ascii 100)) (uri (string-ascii 200)) (funding-goal uint) (royalty-rate uint))
  (let ((nft-id (+ (var-get nft-nonce) u1)))
    (try! (nft-mint? local-art nft-id tx-sender))
    (map-set art-metadata nft-id {
      title: title,
      artist: tx-sender,
      uri: uri,
      funding-goal: funding-goal,
      funding-raised: u0,
      royalty-rate: royalty-rate
    })
    (var-set nft-nonce nft-id)
    (ok nft-id)))

(define-public (fund-art (nft-id uint) (amount uint))
  (let ((metadata (unwrap! (map-get? art-metadata nft-id) err-nft-not-found)))
    (let ((current-funding (default-to u0 (map-get? funders {nft-id: nft-id, funder: tx-sender}))))
      (map-set funders {nft-id: nft-id, funder: tx-sender} (+ current-funding amount))
      (ok (map-set art-metadata nft-id 
        (merge metadata {funding-raised: (+ (get funding-raised metadata) amount)}))))))

(define-public (transfer (nft-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (nft-transfer? local-art nft-id sender recipient)))
