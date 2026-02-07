(define-map industry-entities principal {
  entity-type: (string-ascii 50),
  registration-date: uint,
  status: (string-ascii 20),
  country: (string-ascii 50)
})

(define-map entity-metadata principal (string-utf8 256))

(define-data-var registry-admin principal tx-sender)

(define-read-only (get-entity (entity principal))
  (map-get? industry-entities entity))

(define-read-only (get-entity-metadata (entity principal))
  (map-get? entity-metadata entity))

(define-public (register-entity (entity principal) (entity-type (string-ascii 50)) (country (string-ascii 50)))
  (begin
    (asserts! (is-eq tx-sender (var-get registry-admin)) (err u1))
    (ok (map-set industry-entities entity {
      entity-type: entity-type,
      registration-date: stacks-block-height,
      status: "active",
      country: country
    }))))

(define-public (update-entity-status (entity principal) (status (string-ascii 20)))
  (begin
    (asserts! (is-eq tx-sender (var-get registry-admin)) (err u1))
    (asserts! (is-some (map-get? industry-entities entity)) (err u2))
    (ok (map-set industry-entities entity (merge (unwrap-panic (map-get? industry-entities entity)) { status: status })))))

(define-public (set-metadata (entity principal) (metadata (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender (var-get registry-admin)) (err u1))
    (ok (map-set entity-metadata entity metadata))))

(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get registry-admin)) (err u1))
    (ok (var-set registry-admin new-admin))))
