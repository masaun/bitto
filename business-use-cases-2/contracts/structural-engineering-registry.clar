(define-map registry uint {owner: principal, status: (string-ascii 20), value: uint})
(define-data-var record-nonce uint u0)

(define-public (register-record (value uint))
  (let ((id (+ (var-get record-nonce) u1)))
    (map-set registry id {owner: tx-sender, status: "active", value: value})
    (var-set record-nonce id)
    (ok id)))

(define-public (update-status (id uint) (status (string-ascii 20)))
  (let ((record (unwrap! (map-get? registry id) (err u404))))
    (asserts! (is-eq (get owner record) tx-sender) (err u403))
    (ok (map-set registry id (merge record {status: status})))))

(define-read-only (get-record (id uint))
  (map-get? registry id))

(define-read-only (get-total-records)
  (ok (var-get record-nonce)))
