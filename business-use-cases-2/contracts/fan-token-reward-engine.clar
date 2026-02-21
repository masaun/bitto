(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-insufficient-points (err u103))

(define-map fan-balances principal {points: uint, tokens: uint})
(define-map activities {user: principal, activity-id: uint} {points-earned: uint, timestamp: uint})
(define-data-var activity-counter uint u0)
(define-data-var points-per-token uint u100)

(define-read-only (get-fan-balance (fan principal))
  (map-get? fan-balances fan))

(define-read-only (get-activity (user principal) (activity-id uint))
  (map-get? activities {user: user, activity-id: activity-id}))

(define-read-only (get-conversion-rate)
  (ok (var-get points-per-token)))

(define-public (award-points (fan principal) (points uint))
  (let ((balance (default-to {points: u0, tokens: u0} (map-get? fan-balances fan)))
        (activity-id (+ (var-get activity-counter) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set fan-balances fan {points: (+ (get points balance) points), tokens: (get tokens balance)})
    (map-set activities {user: fan, activity-id: activity-id} {points-earned: points, timestamp: burn-block-height})
    (var-set activity-counter activity-id)
    (ok true)))

(define-public (convert-to-tokens)
  (let ((balance (unwrap! (map-get? fan-balances tx-sender) err-not-found)))
    (asserts! (>= (get points balance) (var-get points-per-token)) err-insufficient-points)
    (let ((tokens (/ (get points balance) (var-get points-per-token)))
          (remaining-points (mod (get points balance) (var-get points-per-token))))
      (map-set fan-balances tx-sender {points: remaining-points, tokens: (+ (get tokens balance) tokens)})
      (ok tokens))))

(define-public (set-conversion-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set points-per-token new-rate)
    (ok true)))
