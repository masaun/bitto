(define-constant contract-owner tx-sender)

(define-map digital-twins (string-ascii 64) {owner: principal, twin-type: (string-ascii 32), status: (string-ascii 20), created-at: uint})
(define-map twin-updates uint {twin-id: (string-ascii 64), update-type: (string-ascii 32), data-hash: (buff 32), timestamp: uint})
(define-data-var update-nonce uint u0)

(define-public (create-twin (twin-id (string-ascii 64)) (twin-type (string-ascii 32)))
  (ok (map-set digital-twins twin-id {owner: tx-sender, twin-type: twin-type, status: "active", created-at: stacks-block-height})))

(define-public (update-twin (twin-id (string-ascii 64)) (update-type (string-ascii 32)) (data-hash (buff 32)))
  (let ((id (var-get update-nonce)))
    (map-set twin-updates id {twin-id: twin-id, update-type: update-type, data-hash: data-hash, timestamp: stacks-block-height})
    (var-set update-nonce (+ id u1))
    (ok id)))

(define-read-only (get-twin (twin-id (string-ascii 64)))
  (ok (map-get? digital-twins twin-id)))

(define-read-only (get-update (update-id uint))
  (ok (map-get? twin-updates update-id)))
