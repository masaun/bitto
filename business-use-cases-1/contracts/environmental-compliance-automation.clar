(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-non-compliant (err u103))

(define-map compliance-rules uint {
  rule-name: (string-ascii 100),
  regulation: (string-ascii 100),
  threshold: uint,
  active: bool,
  created-at: uint
})

(define-map compliance-checks uint {
  farm-id: uint,
  rule-id: uint,
  measured-value: uint,
  compliant: bool,
  checked-at: uint,
  checker: principal
})

(define-data-var rule-nonce uint u0)
(define-data-var check-nonce uint u0)

(define-public (create-compliance-rule (name (string-ascii 100)) (regulation (string-ascii 100)) (threshold uint))
  (let ((id (+ (var-get rule-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set compliance-rules id {
      rule-name: name,
      regulation: regulation,
      threshold: threshold,
      active: true,
      created-at: block-height
    })
    (var-set rule-nonce id)
    (ok id)))

(define-public (perform-compliance-check (farm-id uint) (rule-id uint) (measured uint))
  (let ((rule (unwrap! (map-get? compliance-rules rule-id) err-not-found))
        (check-id (+ (var-get check-nonce) u1))
        (is-compliant (<= measured (get threshold rule))))
    (map-set compliance-checks check-id {
      farm-id: farm-id,
      rule-id: rule-id,
      measured-value: measured,
      compliant: is-compliant,
      checked-at: block-height,
      checker: tx-sender
    })
    (var-set check-nonce check-id)
    (ok is-compliant)))

(define-public (toggle-rule (rule-id uint) (active bool))
  (let ((rule (unwrap! (map-get? compliance-rules rule-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set compliance-rules rule-id (merge rule {active: active}))
    (ok true)))

(define-read-only (get-rule (id uint))
  (ok (map-get? compliance-rules id)))

(define-read-only (get-check (id uint))
  (ok (map-get? compliance-checks id)))
