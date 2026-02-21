(define-map contractors uint {owner: principal, status: (string-ascii 20), value: uint})
(define-data-var contractor-nonce uint u0)

(define-public (register-contractor (value uint))
  (let ((id (+ (var-get contractor-nonce) u1)))
    (map-set contractors id {owner: tx-sender, status: "active", value: value})
    (var-set contractor-nonce id)
    (ok id)))

(define-public (update-status (id uint) (status (string-ascii 20)))
  (let ((contractor (unwrap! (map-get? contractors id) (err u404))))
    (asserts! (is-eq (get owner contractor) tx-sender) (err u403))
    (ok (map-set contractors id (merge contractor {status: status})))))

(define-read-only (get-contractor (id uint))
  (map-get? contractors id))

(define-read-only (get-total-contractors)
  (ok (var-get contractor-nonce)))
