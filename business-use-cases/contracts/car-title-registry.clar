(define-non-fungible-token car-title uint)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-title-not-found (err u102))
(define-constant err-title-exists (err u103))

(define-map titles uint {
  vin: (string-ascii 17),
  make: (string-ascii 50),
  model: (string-ascii 50),
  year: uint,
  owner: principal,
  lien-holder: (optional principal),
  status: (string-ascii 20)
})

(define-map title-history {title-id: uint, event-id: uint} {
  event-type: (string-ascii 50),
  from: (optional principal),
  to: (optional principal),
  timestamp: uint,
  notes: (string-ascii 200)
})

(define-map vin-to-title (string-ascii 17) uint)
(define-data-var title-nonce uint u0)

(define-read-only (get-title (title-id uint))
  (ok (map-get? titles title-id)))

(define-read-only (get-title-by-vin (vin (string-ascii 17)))
  (match (map-get? vin-to-title vin)
    title-id (ok (map-get? titles title-id))
    (ok none)))

(define-read-only (get-title-history (title-id uint) (event-id uint))
  (ok (map-get? title-history {title-id: title-id, event-id: event-id})))

(define-read-only (get-owner (title-id uint))
  (ok (nft-get-owner? car-title title-id)))

(define-public (register-title (vin (string-ascii 17)) (make (string-ascii 50)) (model (string-ascii 50)) (year uint))
  (let ((title-id (+ (var-get title-nonce) u1)))
    (asserts! (is-none (map-get? vin-to-title vin)) err-title-exists)
    (try! (nft-mint? car-title title-id tx-sender))
    (map-set titles title-id {
      vin: vin,
      make: make,
      model: model,
      year: year,
      owner: tx-sender,
      lien-holder: none,
      status: "active"
    })
    (map-set vin-to-title vin title-id)
    (var-set title-nonce title-id)
    (ok title-id)))

(define-public (transfer-title (title-id uint) (recipient principal))
  (let ((title (unwrap! (map-get? titles title-id) err-title-not-found)))
    (asserts! (is-eq tx-sender (get owner title)) err-not-authorized)
    (asserts! (is-none (get lien-holder title)) err-not-authorized)
    (try! (nft-transfer? car-title title-id tx-sender recipient))
    (ok (map-set titles title-id (merge title {owner: recipient})))))

(define-public (add-lien (title-id uint) (lien-holder principal))
  (let ((title (unwrap! (map-get? titles title-id) err-title-not-found)))
    (asserts! (is-eq tx-sender (get owner title)) err-not-authorized)
    (ok (map-set titles title-id (merge title {lien-holder: (some lien-holder)})))))

(define-public (release-lien (title-id uint))
  (let ((title (unwrap! (map-get? titles title-id) err-title-not-found)))
    (asserts! (is-eq (some tx-sender) (get lien-holder title)) err-not-authorized)
    (ok (map-set titles title-id (merge title {lien-holder: none})))))

(define-public (mark-stolen (title-id uint))
  (let ((title (unwrap! (map-get? titles title-id) err-title-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set titles title-id (merge title {status: "stolen"})))))

(define-public (record-event (title-id uint) (event-id uint) (event-type (string-ascii 50)) (notes (string-ascii 200)))
  (begin
    (ok (map-set title-history {title-id: title-id, event-id: event-id} {
      event-type: event-type,
      from: none,
      to: none,
      timestamp: stacks-block-height,
      notes: notes
    }))))
