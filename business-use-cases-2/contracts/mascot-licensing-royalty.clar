(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-licensed (err u102))
(define-constant err-invalid-amount (err u103))

(define-map mascots uint {name: (string-ascii 40), event: (string-ascii 50), royalty-rate: uint})
(define-map licenses {mascot-id: uint, licensee: principal} {sales: uint, royalties-paid: uint, active: bool})
(define-data-var mascot-nonce uint u0)
(define-data-var total-royalties uint u0)

(define-read-only (get-mascot (mascot-id uint))
  (map-get? mascots mascot-id))

(define-read-only (get-license (mascot-id uint) (licensee principal))
  (map-get? licenses {mascot-id: mascot-id, licensee: licensee}))

(define-read-only (get-total-royalties)
  (ok (var-get total-royalties)))

(define-public (register-mascot (name (string-ascii 40)) (event (string-ascii 50)) (royalty-rate uint))
  (let ((mascot-id (+ (var-get mascot-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set mascots mascot-id {name: name, event: event, royalty-rate: royalty-rate})
    (var-set mascot-nonce mascot-id)
    (ok mascot-id)))

(define-public (grant-license (mascot-id uint))
  (let ((mascot (unwrap! (map-get? mascots mascot-id) err-not-found)))
    (asserts! (is-none (map-get? licenses {mascot-id: mascot-id, licensee: tx-sender})) err-already-licensed)
    (map-set licenses {mascot-id: mascot-id, licensee: tx-sender} {sales: u0, royalties-paid: u0, active: true})
    (ok true)))

(define-public (report-sales (mascot-id uint) (sales-amount uint))
  (let ((license (unwrap! (map-get? licenses {mascot-id: mascot-id, licensee: tx-sender}) err-not-found))
        (mascot (unwrap! (map-get? mascots mascot-id) err-not-found)))
    (asserts! (get active license) err-not-found)
    (let ((royalty (/ (* sales-amount (get royalty-rate mascot)) u100)))
      (try! (stx-transfer? royalty tx-sender contract-owner))
      (map-set licenses {mascot-id: mascot-id, licensee: tx-sender} 
        {sales: (+ (get sales license) sales-amount), royalties-paid: (+ (get royalties-paid license) royalty), active: true})
      (var-set total-royalties (+ (var-get total-royalties) royalty))
      (ok royalty))))

(define-public (revoke-license (mascot-id uint) (licensee principal))
  (let ((license (unwrap! (map-get? licenses {mascot-id: mascot-id, licensee: licensee}) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set licenses {mascot-id: mascot-id, licensee: licensee} (merge license {active: false}))
    (ok true)))
