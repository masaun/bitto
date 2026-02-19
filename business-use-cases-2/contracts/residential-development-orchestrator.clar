(define-map projects uint {owner: principal, status: (string-ascii 20), value: uint})
(define-data-var project-nonce uint u0)

(define-public (register-project (value uint))
  (let ((id (+ (var-get project-nonce) u1)))
    (map-set projects id {owner: tx-sender, status: "active", value: value})
    (var-set project-nonce id)
    (ok id)))

(define-public (update-status (id uint) (status (string-ascii 20)))
  (let ((project (unwrap! (map-get? projects id) (err u404))))
    (asserts! (is-eq (get owner project) tx-sender) (err u403))
    (ok (map-set projects id (merge project {status: status})))))

(define-read-only (get-project (id uint))
  (map-get? projects id))

(define-read-only (get-total-projects)
  (ok (var-get project-nonce)))
