(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-invalid-price (err u103))
(define-constant err-insufficient-funds (err u104))

(define-map tickets uint {seller: principal, event-id: uint, price: uint, available: bool})
(define-map user-tickets {user: principal, ticket-id: uint} {purchased: bool})
(define-data-var ticket-nonce uint u0)
(define-data-var platform-fee uint u50)

(define-read-only (get-ticket (ticket-id uint))
  (map-get? tickets ticket-id))

(define-read-only (get-user-ticket (user principal) (ticket-id uint))
  (map-get? user-tickets {user: user, ticket-id: ticket-id}))

(define-read-only (get-platform-fee)
  (ok (var-get platform-fee)))

(define-public (list-ticket (event-id uint) (price uint))
  (let ((ticket-id (+ (var-get ticket-nonce) u1)))
    (asserts! (> price u0) err-invalid-price)
    (map-set tickets ticket-id {seller: tx-sender, event-id: event-id, price: price, available: true})
    (var-set ticket-nonce ticket-id)
    (ok ticket-id)))

(define-public (buy-ticket (ticket-id uint))
  (let ((ticket (unwrap! (map-get? tickets ticket-id) err-not-found)))
    (asserts! (get available ticket) err-not-found)
    (try! (stx-transfer? (get price ticket) tx-sender (get seller ticket)))
    (map-set tickets ticket-id (merge ticket {available: false}))
    (map-set user-tickets {user: tx-sender, ticket-id: ticket-id} {purchased: true})
    (ok true)))

(define-public (cancel-listing (ticket-id uint))
  (let ((ticket (unwrap! (map-get? tickets ticket-id) err-not-found)))
    (asserts! (is-eq (get seller ticket) tx-sender) err-owner-only)
    (map-set tickets ticket-id (merge ticket {available: false}))
    (ok true)))

(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set platform-fee new-fee)
    (ok true)))
