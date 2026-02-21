(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-booked (err u102))
(define-constant err-invalid-amount (err u103))

(define-map suites uint {venue: (string-ascii 50), capacity: uint, price-per-event: uint, booked: bool})
(define-map bookings {suite-id: uint, event-id: uint} {booker: principal, timestamp: uint})
(define-data-var suite-nonce uint u0)
(define-data-var total-revenue uint u0)

(define-read-only (get-suite (suite-id uint))
  (map-get? suites suite-id))

(define-read-only (get-booking (suite-id uint) (event-id uint))
  (map-get? bookings {suite-id: suite-id, event-id: event-id}))

(define-read-only (get-total-revenue)
  (ok (var-get total-revenue)))

(define-public (register-suite (venue (string-ascii 50)) (capacity uint) (price-per-event uint))
  (let ((suite-id (+ (var-get suite-nonce) u1)))
    (asserts! (> price-per-event u0) err-invalid-amount)
    (map-set suites suite-id {venue: venue, capacity: capacity, price-per-event: price-per-event, booked: false})
    (var-set suite-nonce suite-id)
    (ok suite-id)))

(define-public (book-suite (suite-id uint) (event-id uint))
  (let ((suite (unwrap! (map-get? suites suite-id) err-not-found)))
    (asserts! (is-none (map-get? bookings {suite-id: suite-id, event-id: event-id})) err-already-booked)
    (try! (stx-transfer? (get price-per-event suite) tx-sender contract-owner))
    (map-set bookings {suite-id: suite-id, event-id: event-id} {booker: tx-sender, timestamp: burn-block-height})
    (var-set total-revenue (+ (var-get total-revenue) (get price-per-event suite)))
    (ok true)))

(define-public (update-suite-price (suite-id uint) (new-price uint))
  (let ((suite (unwrap! (map-get? suites suite-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> new-price u0) err-invalid-amount)
    (map-set suites suite-id (merge suite {price-per-event: new-price}))
    (ok true)))

(define-public (withdraw-revenue (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= amount (var-get total-revenue)) err-invalid-amount)
    (var-set total-revenue (- (var-get total-revenue) amount))
    (ok true)))
