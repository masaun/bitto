(define-map buildouts uint {owner: principal, status: (string-ascii 20), value: uint})
(define-data-var buildout-nonce uint u0)

(define-public (register-buildout (value uint))
  (let ((id (+ (var-get buildout-nonce) u1)))
    (map-set buildouts id {owner: tx-sender, status: "active", value: value})
    (var-set buildout-nonce id)
    (ok id)))

(define-public (update-status (id uint) (status (string-ascii 20)))
  (let ((buildout (unwrap! (map-get? buildouts id) (err u404))))
    (asserts! (is-eq (get owner buildout) tx-sender) (err u403))
    (ok (map-set buildouts id (merge buildout {status: status})))))

(define-read-only (get-buildout (id uint))
  (map-get? buildouts id))

(define-read-only (get-total-buildouts)
  (ok (var-get buildout-nonce)))
