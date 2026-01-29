(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))

(define-map ship-designs uint {
  design-name: (string-ascii 100),
  designer: principal,
  vessel-type: (string-ascii 50),
  capacity-teu: uint,
  design-hash: (string-ascii 64),
  license-fee: uint,
  open-source: bool,
  created-at: uint
})

(define-map design-licenses uint {
  design-id: uint,
  licensee: principal,
  license-type: (string-ascii 50),
  fee-paid: uint,
  issued-at: uint,
  expires-at: uint
})

(define-data-var design-nonce uint u0)
(define-data-var license-nonce uint u0)

(define-public (publish-design (name (string-ascii 100)) (vtype (string-ascii 50)) (teu uint) (hash (string-ascii 64)) (fee uint) (open bool))
  (let ((id (+ (var-get design-nonce) u1)))
    (map-set ship-designs id {
      design-name: name,
      designer: tx-sender,
      vessel-type: vtype,
      capacity-teu: teu,
      design-hash: hash,
      license-fee: fee,
      open-source: open,
      created-at: block-height
    })
    (var-set design-nonce id)
    (ok id)))

(define-public (purchase-license (design-id uint) (license-type (string-ascii 50)) (duration uint))
  (let ((design (unwrap! (map-get? ship-designs design-id) err-not-found))
        (id (+ (var-get license-nonce) u1)))
    (map-set design-licenses id {
      design-id: design-id,
      licensee: tx-sender,
      license-type: license-type,
      fee-paid: (get license-fee design),
      issued-at: block-height,
      expires-at: (+ block-height duration)
    })
    (var-set license-nonce id)
    (ok id)))

(define-read-only (get-design (id uint))
  (ok (map-get? ship-designs id)))

(define-read-only (get-license (id uint))
  (ok (map-get? design-licenses id)))
