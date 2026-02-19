(define-map entities uint {owner: principal, status: (string-ascii 20), value: uint})
(define-data-var entity-nonce uint u0)

(define-public (register-entity (value uint))
  (let ((id (+ (var-get entity-nonce) u1)))
    (map-set entities id {owner: tx-sender, status: "active", value: value})
    (var-set entity-nonce id)
    (ok id)))

(define-public (update-status (id uint) (status (string-ascii 20)))
  (let ((entity (unwrap! (map-get? entities id) (err u404))))
    (asserts! (is-eq (get owner entity) tx-sender) (err u403))
    (ok (map-set entities id (merge entity {status: status})))))

(define-read-only (get-entity (id uint))
  (map-get? entities id))

(define-read-only (get-total-entities)
  (ok (var-get entity-nonce)))
