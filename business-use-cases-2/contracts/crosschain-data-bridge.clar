(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map bridge-data uint {source-chain: (string-ascii 32), target-chain: (string-ascii 32), data-hash: (buff 32), timestamp: uint})
(define-data-var data-nonce uint u0)

(define-public (submit-bridge-data (source (string-ascii 32)) (target (string-ascii 32)) (hash (buff 32)))
  (let ((id (var-get data-nonce)))
    (map-set bridge-data id {source-chain: source, target-chain: target, data-hash: hash, timestamp: stacks-block-height})
    (var-set data-nonce (+ id u1))
    (ok id)))

(define-read-only (get-bridge-data (id uint))
  (ok (map-get? bridge-data id)))

(define-read-only (get-data-count)
  (ok (var-get data-nonce)))
