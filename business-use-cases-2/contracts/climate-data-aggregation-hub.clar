(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))

(define-map climate-records uint {source: principal, data-type: (string-ascii 32), value: uint, timestamp: uint})
(define-data-var record-nonce uint u0)

(define-public (submit-climate-data (data-type (string-ascii 32)) (value uint))
  (let ((id (var-get record-nonce)))
    (map-set climate-records id {source: tx-sender, data-type: data-type, value: value, timestamp: stacks-block-height})
    (var-set record-nonce (+ id u1))
    (ok id)))

(define-read-only (get-climate-record (id uint))
  (ok (map-get? climate-records id)))

(define-read-only (get-record-count)
  (ok (var-get record-nonce)))
