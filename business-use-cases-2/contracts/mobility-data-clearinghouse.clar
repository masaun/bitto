(define-constant contract-owner tx-sender)

(define-map mobility-data uint {provider: principal, data-type: (string-ascii 32), value: uint, location: (string-ascii 64), timestamp: uint})
(define-data-var data-nonce uint u0)

(define-public (submit-data (data-type (string-ascii 32)) (value uint) (location (string-ascii 64)))
  (let ((id (var-get data-nonce)))
    (map-set mobility-data id {provider: tx-sender, data-type: data-type, value: value, location: location, timestamp: stacks-block-height})
    (var-set data-nonce (+ id u1))
    (ok id)))

(define-read-only (get-data (data-id uint))
  (ok (map-get? mobility-data data-id)))

(define-read-only (get-data-count)
  (ok (var-get data-nonce)))
