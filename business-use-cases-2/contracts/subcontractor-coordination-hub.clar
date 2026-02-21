(define-map subcontractors uint {owner: principal, status: (string-ascii 20), value: uint})
(define-data-var sub-nonce uint u0)

(define-public (register-subcontractor (value uint))
  (let ((id (+ (var-get sub-nonce) u1)))
    (map-set subcontractors id {owner: tx-sender, status: "active", value: value})
    (var-set sub-nonce id)
    (ok id)))

(define-public (update-status (id uint) (status (string-ascii 20)))
  (let ((sub (unwrap! (map-get? subcontractors id) (err u404))))
    (asserts! (is-eq (get owner sub) tx-sender) (err u403))
    (ok (map-set subcontractors id (merge sub {status: status})))))

(define-read-only (get-subcontractor (id uint))
  (map-get? subcontractors id))

(define-read-only (get-total-subcontractors)
  (ok (var-get sub-nonce)))
