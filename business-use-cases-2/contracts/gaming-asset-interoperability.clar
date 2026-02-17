(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))

(define-map game-assets uint {owner: principal, asset-type: (string-ascii 32), game-id: (string-ascii 32), metadata-hash: (buff 32)})
(define-map asset-bridges uint {asset-id: uint, from-game: (string-ascii 32), to-game: (string-ascii 32), bridged-at: uint})
(define-data-var asset-nonce uint u0)
(define-data-var bridge-nonce uint u0)

(define-public (mint-asset (asset-type (string-ascii 32)) (game-id (string-ascii 32)) (metadata (buff 32)))
  (let ((id (var-get asset-nonce)))
    (map-set game-assets id {owner: tx-sender, asset-type: asset-type, game-id: game-id, metadata-hash: metadata})
    (var-set asset-nonce (+ id u1))
    (ok id)))

(define-public (bridge-asset (asset-id uint) (to-game (string-ascii 32)))
  (let ((asset (unwrap! (map-get? game-assets asset-id) err-not-owner))
        (bridge-id (var-get bridge-nonce)))
    (asserts! (is-eq (get owner asset) tx-sender) err-not-owner)
    (map-set asset-bridges bridge-id {asset-id: asset-id, from-game: (get game-id asset), to-game: to-game, bridged-at: stacks-block-height})
    (var-set bridge-nonce (+ bridge-id u1))
    (ok bridge-id)))

(define-read-only (get-asset (asset-id uint))
  (ok (map-get? game-assets asset-id)))

(define-read-only (get-bridge (bridge-id uint))
  (ok (map-get? asset-bridges bridge-id)))
