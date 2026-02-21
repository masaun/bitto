(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-invalid-price (err u103))
(define-constant err-sold-out (err u104))

(define-map winter-tickets uint {seller: principal, sport-type: (string-ascii 40), price: uint, seat-section: (string-ascii 20), available: bool})
(define-map purchases {buyer: principal, ticket-id: uint} {timestamp: uint})
(define-data-var ticket-counter uint u0)
(define-data-var exchange-fee uint u25)

(define-read-only (get-winter-ticket (ticket-id uint))
  (map-get? winter-tickets ticket-id))

(define-read-only (get-purchase (buyer principal) (ticket-id uint))
  (map-get? purchases {buyer: buyer, ticket-id: ticket-id}))

(define-read-only (get-exchange-fee)
  (ok (var-get exchange-fee)))

(define-public (create-listing (sport-type (string-ascii 40)) (price uint) (seat-section (string-ascii 20)))
  (let ((new-id (+ (var-get ticket-counter) u1)))
    (asserts! (> price u0) err-invalid-price)
    (map-set winter-tickets new-id {seller: tx-sender, sport-type: sport-type, price: price, seat-section: seat-section, available: true})
    (var-set ticket-counter new-id)
    (ok new-id)))

(define-public (purchase-ticket (ticket-id uint))
  (let ((ticket (unwrap! (map-get? winter-tickets ticket-id) err-not-found)))
    (asserts! (get available ticket) err-sold-out)
    (try! (stx-transfer? (get price ticket) tx-sender (get seller ticket)))
    (map-set winter-tickets ticket-id (merge ticket {available: false}))
    (map-set purchases {buyer: tx-sender, ticket-id: ticket-id} {timestamp: burn-block-height})
    (ok true)))

(define-public (remove-listing (ticket-id uint))
  (let ((ticket (unwrap! (map-get? winter-tickets ticket-id) err-not-found)))
    (asserts! (is-eq (get seller ticket) tx-sender) err-owner-only)
    (map-set winter-tickets ticket-id (merge ticket {available: false}))
    (ok true)))

(define-public (update-exchange-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set exchange-fee new-fee)
    (ok true)))
