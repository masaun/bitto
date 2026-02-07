(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map compliance-standards uint {
  standard-name: (string-ascii 100),
  regulation: (string-ascii 100),
  requirement: (string-ascii 200),
  active: bool,
  created-at: uint
})

(define-map audit-records uint {
  vessel-imo: (string-ascii 20),
  standard-id: uint,
  auditor: principal,
  compliant: bool,
  findings: (string-ascii 500),
  audit-date: uint,
  next-audit: uint
})

(define-data-var standard-nonce uint u0)
(define-data-var audit-nonce uint u0)

(define-public (create-compliance-standard (name (string-ascii 100)) (regulation (string-ascii 100)) (requirement (string-ascii 200)))
  (let ((id (+ (var-get standard-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set compliance-standards id {
      standard-name: name,
      regulation: regulation,
      requirement: requirement,
      active: true,
      created-at: block-height
    })
    (var-set standard-nonce id)
    (ok id)))

(define-public (record-audit (imo (string-ascii 20)) (standard-id uint) (compliant bool) (findings (string-ascii 500)) (next-audit uint))
  (let ((standard (unwrap! (map-get? compliance-standards standard-id) err-not-found))
        (id (+ (var-get audit-nonce) u1)))
    (map-set audit-records id {
      vessel-imo: imo,
      standard-id: standard-id,
      auditor: tx-sender,
      compliant: compliant,
      findings: findings,
      audit-date: block-height,
      next-audit: next-audit
    })
    (var-set audit-nonce id)
    (ok id)))

(define-read-only (get-standard (id uint))
  (ok (map-get? compliance-standards id)))

(define-read-only (get-audit (id uint))
  (ok (map-get? audit-records id)))
