(define-map ledger uint {owner: principal, status: (string-ascii 20), value: uint})
(define-data-var entry-nonce uint u0)

(define-public (register-entry (value uint))
  (let ((id (+ (var-get entry-nonce) u1)))
    (map-set ledger id {owner: tx-sender, status: "active", value: value})
    (var-set entry-nonce id)
    (ok id)))

(define-public (update-status (id uint) (status (string-ascii 20)))
  (let ((entry (unwrap! (map-get? ledger id) (err u404))))
    (asserts! (is-eq (get owner entry) tx-sender) (err u403))
    (ok (map-set ledger id (merge entry {status: status})))))

(define-read-only (get-entry (id uint))
  (map-get? ledger id))

(define-read-only (get-total-entries)
  (ok (var-get entry-nonce)))
