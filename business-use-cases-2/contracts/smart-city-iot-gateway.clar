(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map devices (string-ascii 64) {owner: principal, device-type: (string-ascii 32), status: (string-ascii 20), registered-at: uint})
(define-map device-data uint {device-id: (string-ascii 64), data-hash: (buff 32), timestamp: uint})
(define-data-var data-nonce uint u0)

(define-public (register-device (device-id (string-ascii 64)) (device-type (string-ascii 32)))
  (ok (map-set devices device-id {owner: tx-sender, device-type: device-type, status: "active", registered-at: stacks-block-height})))

(define-public (submit-device-data (device-id (string-ascii 64)) (data-hash (buff 32)))
  (let ((id (var-get data-nonce)))
    (map-set device-data id {device-id: device-id, data-hash: data-hash, timestamp: stacks-block-height})
    (var-set data-nonce (+ id u1))
    (ok id)))

(define-read-only (get-device (device-id (string-ascii 64)))
  (ok (map-get? devices device-id)))

(define-read-only (get-device-data (id uint))
  (ok (map-get? device-data id)))
