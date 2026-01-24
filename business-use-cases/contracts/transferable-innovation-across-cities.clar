(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-innovation-not-found (err u102))
(define-constant err-already-transferred (err u103))

(define-map innovations uint {
  name: (string-ascii 100),
  description: (string-ascii 500),
  source-city: principal,
  implementation-data: (string-ascii 1000),
  verified: bool,
  transfer-count: uint
})

(define-map city-adoptions {city: principal, innovation-id: uint} {
  adopted: bool,
  implementation-date: uint,
  success-rate: uint
})

(define-data-var innovation-nonce uint u0)

(define-read-only (get-innovation (innovation-id uint))
  (ok (map-get? innovations innovation-id)))

(define-read-only (get-adoption (city principal) (innovation-id uint))
  (ok (map-get? city-adoptions {city: city, innovation-id: innovation-id})))

(define-public (register-innovation (name (string-ascii 100)) (description (string-ascii 500)) (implementation-data (string-ascii 1000)))
  (let ((innovation-id (+ (var-get innovation-nonce) u1)))
    (map-set innovations innovation-id {
      name: name,
      description: description,
      source-city: tx-sender,
      implementation-data: implementation-data,
      verified: false,
      transfer-count: u0
    })
    (var-set innovation-nonce innovation-id)
    (ok innovation-id)))

(define-public (adopt-innovation (innovation-id uint))
  (let ((innovation (unwrap! (map-get? innovations innovation-id) err-innovation-not-found)))
    (asserts! (get verified innovation) err-not-authorized)
    (map-set city-adoptions {city: tx-sender, innovation-id: innovation-id} {
      adopted: true,
      implementation-date: stacks-block-height,
      success-rate: u0
    })
    (ok (map-set innovations innovation-id (merge innovation {transfer-count: (+ (get transfer-count innovation) u1)})))))

(define-public (verify-innovation (innovation-id uint))
  (let ((innovation (unwrap! (map-get? innovations innovation-id) err-innovation-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set innovations innovation-id (merge innovation {verified: true})))))

(define-public (update-success-rate (innovation-id uint) (rate uint))
  (begin
    (map-set city-adoptions {city: tx-sender, innovation-id: innovation-id} 
      (merge (unwrap! (map-get? city-adoptions {city: tx-sender, innovation-id: innovation-id}) err-not-authorized)
        {success-rate: rate}))
    (ok true)))
