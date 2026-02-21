(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-invalid-data (err u102))

(define-map data-feeds uint {sport: (string-ascii 40), data-type: (string-ascii 40), value: uint, timestamp: uint, verified: bool})
(define-map subscribers principal {subscribed: bool, access-level: uint})
(define-data-var feed-nonce uint u0)
(define-data-var total-feeds uint u0)

(define-read-only (get-data-feed (feed-id uint))
  (map-get? data-feeds feed-id))

(define-read-only (get-subscriber (subscriber principal))
  (map-get? subscribers subscriber))

(define-read-only (get-total-feeds)
  (ok (var-get total-feeds)))

(define-public (publish-data (sport (string-ascii 40)) (data-type (string-ascii 40)) (value uint))
  (let ((feed-id (+ (var-get feed-nonce) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set data-feeds feed-id {sport: sport, data-type: data-type, value: value, timestamp: burn-block-height, verified: false})
    (var-set feed-nonce feed-id)
    (var-set total-feeds (+ (var-get total-feeds) u1))
    (ok feed-id)))

(define-public (verify-data (feed-id uint))
  (let ((feed (unwrap! (map-get? data-feeds feed-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set data-feeds feed-id (merge feed {verified: true}))
    (ok true)))

(define-public (subscribe (access-level uint))
  (begin
    (map-set subscribers tx-sender {subscribed: true, access-level: access-level})
    (ok true)))

(define-public (update-access (subscriber principal) (new-level uint))
  (let ((sub (unwrap! (map-get? subscribers subscriber) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set subscribers subscriber (merge sub {access-level: new-level}))
    (ok true)))
