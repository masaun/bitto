(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map records uint {creator: principal, data-hash: (buff 32), timestamp: uint, status: (string-ascii 20)})
(define-data-var record-nonce uint u0)

(define-public (create-record (data-hash (buff 32)))
  (let ((id (var-get record-nonce)))
    (map-set records id {creator: tx-sender, data-hash: data-hash, timestamp: stacks-block-height, status: "active"})
    (var-set record-nonce (+ id u1))
    (ok id)))

(define-public (update-status (record-id uint) (status (string-ascii 20)))
  (let ((record (unwrap! (map-get? records record-id) err-not-found)))
    (asserts! (is-eq (get creator record) tx-sender) err-owner-only)
    (ok (map-set records record-id (merge record {status: status})))))

(define-read-only (get-record (record-id uint))
  (ok (map-get? records record-id)))

(define-read-only (get-record-count)
  (ok (var-get record-nonce)))
